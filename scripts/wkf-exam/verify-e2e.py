import base64
import json
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

PORT = 3123
BASE_URL = f"http://127.0.0.1:{PORT}"


def wait_for_server(url: str, timeout: float = 30.0):
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    raise RuntimeError(f"Server at {url} did not start within {timeout}s")


def main():
    proc = subprocess.Popen(
        ["npx", "next", "start", "-p", str(PORT)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True,
    )
    try:
        wait_for_server(f"{BASE_URL}/wkf-exam")
        print("Server started on", BASE_URL)

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()

            # Bypass splash screen and cookie banner in storage for clean E2E testing
            page.add_init_script("""
                window.sessionStorage.setItem('ksport_splash_seen', '1');
                window.localStorage.setItem('ks-cookie-consent', JSON.stringify({
                    version: 1, necessary: true, analytics: false, personalization: false, savedAt: new Date().toISOString()
                }));
            """)

            # 1. Verify /wkf-exam Home & Empty State & no technical version leaks
            page.goto(f"{BASE_URL}/wkf-exam", wait_until="networkidle")
            h1_count = page.locator("h1").count()
            assert h1_count == 1, f"Expected 1 h1 on /wkf-exam, got {h1_count}"
            assert "Ôn thi luật trọng tài Karate WKF" in page.locator("h1").inner_text()
            assert page.locator("text=246 câu").count() >= 1
            assert page.locator("text=132 câu").count() >= 1
            assert page.locator("text=07/2026").count() == 0, "Technical PDF version should not appear on learner home"
            print("PASS 1: /wkf-exam home & empty state verified (no technical tags)")

            # 2. Scenario 1, 3, 4, 5, 6, 7, 11:
            # Select Tiếng Việt on /wkf-exam/kumite -> Start Practice -> Toggle language -> Answer True/False -> Reload
            page.goto(f"{BASE_URL}/wkf-exam/kumite", wait_until="networkidle")
            assert page.locator("h1").count() == 1
            assert page.locator("text=Chọn ngôn ngữ làm bài").is_visible()
            # Default is Tiếng Việt; verify both radio labels exist
            assert page.locator("label.wkf-mode-option:has-text('Tiếng Việt')").is_visible()
            assert page.locator("label.wkf-mode-option:has-text('English')").is_visible()
            page.click("button[type='submit']")
            page.wait_for_url("**/wkf-exam/practice/**", timeout=10000)
            practice_url_vi = page.url

            # Question 1 should default to Vietnamese and show "Dịch sang tiếng Anh"
            q1_vi_text = page.locator(".wkf-question-text-en").inner_text()
            toggle_btn = page.locator("button:has-text('Dịch sang tiếng Anh')")
            assert toggle_btn.is_visible(), "Expected 'Dịch sang tiếng Anh' button when viewing Vietnamese"

            # Click "Dịch sang tiếng Anh" -> text changes to English, button becomes "Dịch sang tiếng Việt"
            toggle_btn.click()
            q1_en_text = page.locator(".wkf-question-text-en").inner_text()
            assert q1_en_text != q1_vi_text, "Expected English text to differ from Vietnamese translation"
            toggle_back_btn = page.locator("button:has-text('Dịch sang tiếng Việt')")
            assert toggle_back_btn.is_visible(), "Expected 'Dịch sang tiếng Việt' button when viewing English"

            # Click "Dịch sang tiếng Việt" -> restores Vietnamese text
            toggle_back_btn.click()
            assert page.locator(".wkf-question-text-en").inner_text() == q1_vi_text

            # Answer Question 1 (True) and check feedback panel colors/labels + language toggle after answering
            page.click("button.wkf-tf-btn:has-text('Đúng (True)')")
            page.wait_for_selector(".wkf-feedback-panel", timeout=5000)
            feedback_text = page.locator(".wkf-feedback-panel").inner_text()
            assert "Bạn đã chọn: Đúng (True)" in feedback_text
            assert ("Chính xác" in feedback_text) or ("Chưa chính xác" in feedback_text)
            if "Chưa chính xác" in feedback_text:
                assert "Câu trả lời đúng là:" in feedback_text
            else:
                assert "Câu trả lời đúng là:" not in feedback_text

            # Scenario 4: Toggle question language AFTER selecting an answer -> answer & feedback remain intact
            page.click("button:has-text('Dịch sang tiếng Anh')")
            assert page.locator(".wkf-question-text-en").inner_text() == q1_en_text
            assert "Bạn đã chọn: Đúng (True)" in page.locator(".wkf-feedback-panel").inner_text()
            page.click("button:has-text('Dịch sang tiếng Việt')")
            assert page.locator(".wkf-question-text-en").inner_text() == q1_vi_text

            # Scenario 11: Navigate to Question 2, reload page, verify language (vi) and question order persist
            page.click("button:has-text('Câu tiếp')")
            assert "Câu 2 / 20" in page.locator("#wkf-current-question-pos").inner_text()
            q2_vi_text = page.locator(".wkf-question-text-en").inner_text()
            page.reload(wait_until="networkidle")
            assert "Câu 2 / 20" in page.locator("#wkf-current-question-pos").inner_text()
            assert page.locator(".wkf-question-text-en").inner_text() == q2_vi_text
            assert page.locator("button:has-text('Dịch sang tiếng Anh')").is_visible()
            print("PASS 2: Vietnamese mode, per-question translation toggle, feedback & reload persistence verified")

            # 3. Scenario 2, 5, 6, 7, 8, 9, 10:
            # Select English on /wkf-exam/kata?mode=exam -> Start Exam -> Answer True & False, leave 18 unanswered -> Submit
            page.goto(f"{BASE_URL}/wkf-exam/kata?mode=exam", wait_until="networkidle")
            page.click("label.wkf-mode-option:has-text('English')")
            page.click("button[type='submit']")
            page.wait_for_url("**/wkf-exam/practice/**", timeout=10000)
            exam_attempt_id = page.url.split("/")[-1]

            # Verify default language is English ("Dịch sang tiếng Việt" button visible)
            assert page.locator("button:has-text('Dịch sang tiếng Việt')").is_visible()
            q1_exam_en = page.locator(".wkf-question-text-en").inner_text()
            page.click("button:has-text('Dịch sang tiếng Việt')")
            q1_exam_vi = page.locator(".wkf-question-text-en").inner_text()
            assert q1_exam_en != q1_exam_vi
            page.click("button:has-text('Dịch sang tiếng Anh')")
            assert page.locator(".wkf-question-text-en").inner_text() == q1_exam_en

            # Answer Question 1 = True, Question 2 = False, leave 3..20 unanswered
            page.click("button.wkf-tf-btn:has-text('Đúng (True)')")
            page.click("button:has-text('Câu tiếp')")
            page.click("button.wkf-tf-btn:has-text('Sai (False)')")

            order_attempt_1 = page.evaluate(
                """(id) => {
                    const map = JSON.parse(localStorage.getItem('ksport_wkf_exam_v1_attempts') || '{}');
                    return map[id]?.questionIds || [];
                }""",
                exam_attempt_id,
            )
            assert len(order_attempt_1) == 20

            # Submit exam -> confirm modal -> redirect to results
            page.click(".wkf-side-actions button")
            page.wait_for_selector(".wkf-modal-dialog", timeout=5000)
            page.click(".wkf-modal-actions button.wkf-btn-red")
            page.wait_for_url("**/wkf-exam/results/**", timeout=10000)

            # Scenario 9: Verify simplified results screen (no technical strings, green/red/neutral status, per-question translation button)
            results_body = page.locator("main").inner_text()
            assert "Câu gốc #" not in results_body, "Technical 'Câu gốc #' must not appear on learner results"
            assert "PDF 07/2026" not in results_body, "Technical PDF version must not appear on learner results"
            assert "BẢNG ĐÁP ÁN 2027" not in results_body, "Technical answer key source must not appear on learner results"
            assert "Bạn đã chọn: Đúng (True)" in results_body
            assert "Bạn đã chọn: Sai (False)" in results_body
            assert "Chưa trả lời" in results_body
            assert "Câu trả lời đúng là:" in results_body

            # Check green color (#15803d -> rgb(21, 128, 61)) on .wkf-status-tag.is-correct or .wkf-text-correct
            green_color = page.evaluate("""() => {
                const el = document.querySelector('.wkf-text-correct');
                return el ? window.getComputedStyle(el).color : '';
            }""")
            assert green_color == "rgb(21, 128, 61)", f"Expected green rgb(21, 128, 61), got {green_color}"

            # Check per-question translation toggle on Results screen
            first_result_q = page.locator(".wkf-review-item").first
            first_res_text_before = first_result_q.locator(".wkf-review-question-en").inner_text()
            first_result_q.locator("button:has-text('Dịch sang tiếng')").click()
            first_res_text_after = first_result_q.locator(".wkf-review-question-en").inner_text()
            assert first_res_text_before != first_res_text_after, "Expected result item translation toggle to switch language"
            print("PASS 3: English mode, simplified results UI, green #15803D color & results translation toggle verified")

            # 4. Scenario 10: Verify "Thi lại" button exact label and new shuffled order
            retake_btn = page.locator(".wkf-result-actions-bar button").first
            assert retake_btn.inner_text().strip() == "Thi lại", f"Unexpected label: {retake_btn.inner_text()}"
            retake_btn.click()
            page.wait_for_url("**/wkf-exam/practice/**", timeout=10000)
            retake_attempt_id = page.url.split("/")[-1]
            assert retake_attempt_id != exam_attempt_id

            order_attempt_2 = page.evaluate(
                """(id) => {
                    const map = JSON.parse(localStorage.getItem('ksport_wkf_exam_v1_attempts') || '{}');
                    return map[id]?.questionIds || [];
                }""",
                retake_attempt_id,
            )
            assert len(order_attempt_2) == 20
            assert order_attempt_1 != order_attempt_2, "Retake order must differ from previous attempt!"
            print("PASS 4: 'Thi lại' created new attempt with different question order & preserved language")

            # 5. Verify /wkf-exam/history and /wkf-exam/mistakes
            page.goto(f"{BASE_URL}/wkf-exam/history", wait_until="networkidle")
            assert page.locator("h1").count() == 1
            assert page.locator(".wkf-table tbody tr").count() >= 2

            page.goto(f"{BASE_URL}/wkf-exam/mistakes", wait_until="networkidle")
            assert page.locator("h1").count() == 1
            print("PASS 5: /wkf-exam/history and /wkf-exam/mistakes verified")

            # 6. Scenario 12: Verify Responsive widths (375px, 390px, 768px, 1024px, 1440px) & Mobile Drawer
            for vw in [375, 390, 768, 1024, 1440]:
                page.set_viewport_size({"width": vw, "height": 844})
                for route in [
                    "/wkf-exam",
                    "/wkf-exam/kumite",
                    f"/wkf-exam/practice/{retake_attempt_id}",
                    f"/wkf-exam/results/{exam_attempt_id}",
                ]:
                    page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
                    overflow = page.evaluate(
                        "document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"
                    )
                    assert not overflow, f"Horizontal overflow detected on {route} at {vw}px"
                    if vw <= 768 and "/practice/" in route:
                        page.click(".wkf-mobile-nav-trigger")
                        assert page.locator(".wkf-exam-side-col.is-mobile-open").is_visible()
                        page.click(".wkf-drawer-close-btn")
            print("PASS 6: Responsive checks (375, 390, 768, 1024, 1440px) & mobile drawer verified")

            # 7. Verify Admin route protection & authenticated Admin WKF manager retains metadata
            page.set_viewport_size({"width": 1440, "height": 900})
            admin_payload = base64.b64encode(
                json.dumps({"username": "admin-k-sport", "role": "admin", "name": "Quản trị viên Hệ thống"}).encode()
            ).decode()
            context.add_cookies(
                [
                    {
                        "name": "ksport_admin_token",
                        "value": admin_payload,
                        "domain": "127.0.0.1",
                        "path": "/",
                    }
                ]
            )
            page.goto(f"{BASE_URL}/admin/wkf-exam", wait_until="networkidle")
            assert page.locator("h1").count() == 1
            admin_text = page.locator(".wkf-admin-summary-grid").inner_text()
            assert "378 / 378" in admin_text
            assert "07/2026" in admin_text
            print("PASS 7: /admin/wkf-exam metadata & verified 378/378 status confirmed")

            browser.close()
        print("ALL E2E PLAYWRIGHT CHECKS PASSED!")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()


if __name__ == "__main__":
    main()
