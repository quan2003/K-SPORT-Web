"""
Extracts canonical English and Vietnamese question texts directly from:
- data/wkf-exam/import/WKF_Kumite_SongNgu_AnhViet.pdf (246 questions)
- data/wkf-exam/import/Kata_ParaKarate_SongNgu_AnhViet.pdf (132 questions)

Generates:
- scripts/wkf-exam/bilingual_corpus.py
- scripts/wkf-exam/translations_vi.py
"""

import re
import fitz


def extract_bilingual_pdf(path: str, expected_count: int) -> dict[int, dict[str, str]]:
    doc = fitz.open(path)

    # 1. Collect all question number anchors across all pages
    anchors = []
    for p_no, p in enumerate(doc):
        d = p.get_text("dict")
        for b in d["blocks"]:
            if "lines" not in b:
                continue
            for l in b["lines"]:
                for s in l["spans"]:
                    t = s["text"].strip()
                    if t.isdigit() and s["bbox"][0] < 75:
                        num = int(t)
                        if 1 <= num <= expected_count:
                            anchors.append(
                                {
                                    "num": num,
                                    "page": p_no,
                                    "y0": s["bbox"][1],
                                    "y1": s["bbox"][3],
                                }
                            )

    anchors.sort(key=lambda a: a["num"])
    assert len(anchors) == expected_count, f"Found {len(anchors)} anchors, expected {expected_count} in {path}"

    page_anchors: dict[int, list[dict]] = {}
    for a in anchors:
        page_anchors.setdefault(a["page"], []).append(a)
    for p_no in page_anchors:
        page_anchors[p_no].sort(key=lambda a: a["y0"])

    results: dict[int, dict[str, str]] = {}

    for p_no, p in enumerate(doc):
        p_anchors = page_anchors.get(p_no, [])
        d = p.get_text("dict")

        spans = []
        for b in d["blocks"]:
            if "lines" not in b:
                continue
            for l in b["lines"]:
                for s in l["spans"]:
                    t = s["text"].strip()
                    if not t or t in ["No.", "English", "Tiếng Việt"] or "Examination Questions for" in t:
                        continue
                    if s["bbox"][1] > 546:
                        continue
                    spans.append(s)

        spans.sort(key=lambda s: (s["bbox"][1], s["bbox"][0]))

        # Check if text overflows before the first anchor on this page
        first_y = p_anchors[0]["y0"] if p_anchors else 550.0
        overflow_spans = [s for s in spans if s["bbox"][3] < first_y]
        if overflow_spans and p_no > 0:
            prev_p_anchors = page_anchors.get(p_no - 1, [])
            if prev_p_anchors:
                last_prev_num = prev_p_anchors[-1]["num"]
                for s in overflow_spans:
                    if s["bbox"][0] < 435:
                        results[last_prev_num]["en"] += " " + s["text"].strip()
                    else:
                        results[last_prev_num]["vi"] += " " + s["text"].strip()

        for idx, a in enumerate(p_anchors):
            num = a["num"]
            y_start = a["y0"] - 2
            y_end = p_anchors[idx + 1]["y0"] - 2 if idx + 1 < len(p_anchors) else 546.5

            en_spans = []
            vi_spans = []

            for s in spans:
                sy = (s["bbox"][1] + s["bbox"][3]) / 2.0
                if y_start <= sy < y_end:
                    sx = s["bbox"][0]
                    if sx < 75 and s["text"].strip() == str(num):
                        continue
                    if sx < 435:
                        en_spans.append(s)
                    else:
                        vi_spans.append(s)

            en_spans.sort(key=lambda s: (s["bbox"][1], s["bbox"][0]))
            vi_spans.sort(key=lambda s: (s["bbox"][1], s["bbox"][0]))

            en_text = re.sub(r"\s+", " ", " ".join(s["text"].strip() for s in en_spans)).strip()
            vi_text = re.sub(r"\s+", " ", " ".join(s["text"].strip() for s in vi_spans)).strip()

            results[num] = {"en": en_text, "vi": vi_text}

    for num in results:
        results[num]["en"] = re.sub(r"\s+", " ", results[num]["en"]).strip()
        results[num]["vi"] = re.sub(r"\s+", " ", results[num]["vi"]).strip()
        assert len(results[num]["en"]) > 0, f"Empty EN in question {num}"
        assert len(results[num]["vi"]) > 0, f"Empty VI in question {num}"

    return results


def main():
    kumite_pdf = "data/wkf-exam/import/WKF_Kumite_SongNgu_AnhViet.pdf"
    kata_pdf = "data/wkf-exam/import/Kata_ParaKarate_SongNgu_AnhViet.pdf"

    print("Extracting Kumite bilingual questions...")
    kumite_res = extract_bilingual_pdf(kumite_pdf, 246)
    print(f"Extracted {len(kumite_res)} / 246 Kumite questions successfully.")

    print("Extracting Kata & Para Karate bilingual questions...")
    kata_res = extract_bilingual_pdf(kata_pdf, 132)
    print(f"Extracted {len(kata_res)} / 132 Kata questions successfully.")

    # Write bilingual corpus
    with open("scripts/wkf-exam/bilingual_corpus.py", "w", encoding="utf-8") as f:
        f.write('"""\n')
        f.write("WKF Referee Academy - Canonical Bilingual Corpus (English & Vietnamese)\n")
        f.write("Extracted directly from:\n")
        f.write("  - WKF_Kumite_SongNgu_AnhViet.pdf (246 questions)\n")
        f.write("  - Kata_ParaKarate_SongNgu_AnhViet.pdf (132 questions)\n")
        f.write('"""\n\n')

        f.write("KUMITE_BILINGUAL: dict[int, dict[str, str]] = {\n")
        for num in range(1, 247):
            en = kumite_res[num]["en"].replace("\\", "\\\\").replace('"', '\\"')
            vi = kumite_res[num]["vi"].replace("\\", "\\\\").replace('"', '\\"')
            f.write(f'    {num}: {{"en": "{en}", "vi": "{vi}"}},\n')
        f.write("}\n\n")

        f.write("KATA_BILINGUAL: dict[int, dict[str, str]] = {\n")
        for num in range(1, 133):
            en = kata_res[num]["en"].replace("\\", "\\\\").replace('"', '\\"')
            vi = kata_res[num]["vi"].replace("\\", "\\\\").replace('"', '\\"')
            f.write(f'    {num}: {{"en": "{en}", "vi": "{vi}"}},\n')
        f.write("}\n")

    # Also sync translations_vi.py
    with open("scripts/wkf-exam/translations_vi.py", "w", encoding="utf-8") as f:
        f.write('"""\n')
        f.write("WKF Referee Academy - Official Vietnamese Question Translations\n")
        f.write('"""\n\n')

        f.write("KUMITE_TRANSLATIONS_VI: dict[int, str] = {\n")
        for num in range(1, 247):
            vi = kumite_res[num]["vi"].replace("\\", "\\\\").replace('"', '\\"')
            f.write(f'    {num}: "{vi}",\n')
        f.write("}\n\n")

        f.write("KATA_TRANSLATIONS_VI: dict[int, str] = {\n")
        for num in range(1, 133):
            vi = kata_res[num]["vi"].replace("\\", "\\\\").replace('"', '\\"')
            f.write(f'    {num}: "{vi}",\n')
        f.write("}\n")

    print("Corpus files generated successfully!")


if __name__ == "__main__":
    main()

