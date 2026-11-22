from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(r"d:\k-sport-web")
OUT_PDF = ROOT / "public" / "documents" / "ksport_ranking_rules_2026.pdf"
LOGO_PATH = ROOT / "public" / "images" / "logo-header.png"

NAVY = colors.HexColor("#061830")
RED = colors.HexColor("#d50b27")
SLATE = colors.HexColor("#475569")
LIGHT_BG = colors.HexColor("#f8fafc")
BORDER = colors.HexColor("#cbd5e1")
AMBER_BG = colors.HexColor("#fffbeb")
AMBER_BORDER = colors.HexColor("#f59e0b")


def register_fonts():
    fonts_dir = Path(r"C:\Windows\Fonts")
    pdfmetrics.registerFont(TTFont("ArialVN", str(fonts_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("ArialVN-Bold", str(fonts_dir / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("ArialVN-Italic", str(fonts_dir / "ariali.ttf")))
    pdfmetrics.registerFontFamily(
        "ArialVN",
        normal="ArialVN",
        bold="ArialVN-Bold",
        italic="ArialVN-Italic",
        boldItalic="ArialVN-Bold",
    )


def draw_chrome(canvas, doc):
    page_num = doc.page
    width, height = A4
    canvas.saveState()

    if page_num == 1:
        # Top red bar & bottom navy footer strip on cover
        canvas.setFillColor(RED)
        canvas.rect(0, height - 10 * mm, width, 10 * mm, fill=1, stroke=0)
        canvas.setFillColor(NAVY)
        canvas.rect(0, 0, width, 16 * mm, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont("ArialVN", 9)
        canvas.drawCentredString(
            width / 2,
            6.5 * mm,
            "K-SPORT · Hệ thống Quản lý & Điều hành Giải đấu Karate · https://www.k-sport.net",
        )
    else:
        # Running header
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.6)
        canvas.line(20 * mm, height - 16 * mm, width - 20 * mm, height - 16 * mm)
        canvas.setFillColor(NAVY)
        canvas.setFont("ArialVN-Bold", 8.5)
        canvas.drawString(20 * mm, height - 13 * mm, "K-SPORT · QUY TẮC XẾP HẠNG KARATE 2026")
        canvas.setFillColor(SLATE)
        canvas.setFont("ArialVN", 8.5)
        canvas.drawRightString(width - 20 * mm, height - 13 * mm, "Tham chiếu chuẩn WKF")

        # Running footer
        canvas.line(20 * mm, 15 * mm, width - 20 * mm, 15 * mm)
        canvas.setFillColor(SLATE)
        canvas.setFont("ArialVN", 8.5)
        canvas.drawString(20 * mm, 10 * mm, "https://www.k-sport.net/ranking")
        canvas.drawRightString(width - 20 * mm, 10 * mm, f"Trang {page_num}")

    canvas.restoreState()


def build_pdf():
    register_fonts()
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUT_PDF),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=24 * mm,
        bottomMargin=22 * mm,
        title="Quy tắc Xếp hạng Vận động viên Karate K-SPORT 2026",
        author="K-SPORT",
    )

    styles = getSampleStyleSheet()
    s_cover_tag = ParagraphStyle(
        "CoverTag",
        parent=styles["Normal"],
        fontName="ArialVN-Bold",
        fontSize=11,
        textColor=RED,
        alignment=1,
        spaceAfter=10,
    )
    s_cover_title = ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="ArialVN-Bold",
        fontSize=24,
        leading=31,
        textColor=NAVY,
        alignment=1,
        spaceAfter=10,
    )
    s_cover_sub = ParagraphStyle(
        "CoverSub",
        parent=styles["Normal"],
        fontName="ArialVN",
        fontSize=13,
        leading=19,
        textColor=SLATE,
        alignment=1,
        spaceAfter=24,
    )
    s_h1 = ParagraphStyle(
        "H1VN",
        parent=styles["Heading1"],
        fontName="ArialVN-Bold",
        fontSize=14.5,
        leading=20,
        textColor=NAVY,
        spaceBefore=12,
        spaceAfter=6,
    )
    s_h2 = ParagraphStyle(
        "H2VN",
        parent=styles["Heading2"],
        fontName="ArialVN-Bold",
        fontSize=11.5,
        leading=16,
        textColor=RED,
        spaceBefore=9,
        spaceAfter=4,
    )
    s_body = ParagraphStyle(
        "BodyVN",
        parent=styles["Normal"],
        fontName="ArialVN",
        fontSize=10.5,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6,
    )
    s_th = ParagraphStyle(
        "THVN",
        parent=styles["Normal"],
        fontName="ArialVN-Bold",
        fontSize=9.5,
        leading=13,
        textColor=colors.white,
    )
    s_td = ParagraphStyle(
        "TDVN",
        parent=styles["Normal"],
        fontName="ArialVN",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []

    # --- PAGE 1: COVER ---
    story.append(Spacer(1, 26 * mm))
    if LOGO_PATH.exists():
        img = Image(str(LOGO_PATH), width=78 * mm, height=25 * mm, kind="proportional")
        img.hAlign = "CENTER"
        story.append(img)
        story.append(Spacer(1, 18 * mm))

    story.append(Paragraph("TÀI LIỆU CÔNG KHAI HỆ THỐNG K-SPORT", s_cover_tag))
    story.append(
        Paragraph(
            "QUY TẮC XẾP HẠNG<br/>VẬN ĐỘNG VIÊN KARATE",
            s_cover_title,
        )
    )
    story.append(
        Paragraph(
            "Phiên bản 2026 · Xây dựng tham chiếu theo chuẩn Liên đoàn Karate Thế giới (WKF)",
            s_cover_sub,
        )
    )

    cover_box = Table(
        [
            [Paragraph("<b>Đơn vị ban hành</b>", s_td), Paragraph("Hệ thống Quản lý & Điều hành Giải đấu K-SPORT", s_td)],
            [Paragraph("<b>Phạm vi áp dụng</b>", s_td), Paragraph("Các giải đấu Kata & Kumite công khai trên k-sport.net", s_td)],
            [Paragraph("<b>Thời điểm hiệu lực</b>", s_td), Paragraph("Mùa giải 2026 trở đi", s_td)],
            [Paragraph("<b>Cổng tra cứu chính thức</b>", s_td), Paragraph("https://www.k-sport.net/ranking", s_td)],
        ],
        colWidths=[52 * mm, 108 * mm],
    )
    cover_box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
                ("BOX", (0, 0), (-1, -1), 0.8, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(Spacer(1, 14 * mm))
    story.append(cover_box)
    story.append(PageBreak())

    # --- PAGE 2: TOC & GENERAL PRINCIPLES ---
    story.append(Paragraph("MỤC LỤC", s_h1))
    toc_table = Table(
        [
            [Paragraph("<b>Phần I</b>", s_td), Paragraph("Nguyên tắc chung của Hệ thống Xếp hạng K-SPORT", s_td), Paragraph("Trang 2", s_td)],
            [Paragraph("<b>Phần II</b>", s_td), Paragraph("Bảng quy đổi điểm gốc theo thành tích huy chương", s_td), Paragraph("Trang 3", s_td)],
            [Paragraph("<b>Phần III</b>", s_td), Paragraph("Phân loại cấp độ giải đấu & Hệ số nhân điểm", s_td), Paragraph("Trang 3", s_td)],
            [Paragraph("<b>Phần IV</b>", s_td), Paragraph("Quy tắc phân định khi bằng điểm (Tie-break chuẩn WKF)", s_td), Paragraph("Trang 4", s_td)],
            [Paragraph("<b>Phần V</b>", s_td), Paragraph("Ví dụ minh họa & Ghi chú công khai", s_td), Paragraph("Trang 4", s_td)],
        ],
        colWidths=[24 * mm, 122 * mm, 24 * mm],
    )
    toc_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("LINEBELOW", (0, 0), (-1, -1), 0.4, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(toc_table)
    story.append(Spacer(1, 8 * mm))

    story.append(Paragraph("PHẦN I. NGUYÊN TẮC CHUNG", s_h1))
    story.append(Paragraph("1.1. Mục đích & Phạm vi áp dụng", s_h2))
    story.append(
        Paragraph(
            "Bảng xếp hạng K-SPORT được xây dựng nhằm ghi nhận minh bạch thành tích thi đấu của các vận động viên Karate ở hai phân môn <b>Kata</b> và <b>Kumite</b> trên các giải đấu được công khai kết quả chính thức trên cổng thông tin <b>k-sport.net</b>.",
            s_body,
        )
    )
    story.append(Paragraph("1.2. Tính điểm theo thứ hạng chung cuộc", s_h2))
    story.append(
        Paragraph(
            "Tuân theo nguyên tắc xếp hạng của Liên đoàn Karate Thế giới (WKF), điểm số của vận động viên tại mỗi nội dung thi đấu được tính căn cứ vào <b>thứ hạng cuối cùng</b> đạt được (Hạng 1, Hạng 2, Đồng hạng 3...), không phụ thuộc vào cách biệt tỉ số từng trận đấu.",
            s_body,
        )
    )
    story.append(Paragraph("1.3. Quy định đối với 2 Huy chương Đồng", s_h2))
    story.append(
        Paragraph(
            "Ở các nội dung áp dụng thể thức loại trực tiếp có vòng đấu vớt (<i>WKF Repechage</i>) hoặc thể thức <i>Hai Huy chương Đồng</i>, cả hai vận động viên đạt đồng hạng Ba (HCĐ) đều nhận số điểm xếp hạng ngang nhau.",
            s_body,
        )
    )
    story.append(Paragraph("1.4. Tổng hợp theo mùa giải và toàn thời gian", s_h2))
    story.append(
        Paragraph(
            "• <b>Khi lọc theo một mùa giải cụ thể (ví dụ 2026):</b> Chỉ tính tổng điểm và huy chương vận động viên đạt được trong các giải thuộc mùa giải đó.<br/>• <b>Khi chọn chế độ \"Tất cả mùa giải\":</b> Hệ thống cộng dồn toàn bộ điểm tích lũy và số lượng Huy chương Vàng, Bạc, Đồng của vận động viên qua các giải đấu đã công khai.",
            s_body,
        )
    )
    story.append(PageBreak())

    # --- PAGE 3: POINT TABLE & TOURNAMENT TIERS ---
    story.append(Paragraph("PHẦN II. BẢNG QUY ĐỔI ĐIỂM GỐC (HỆ SỐ × 1.0)", s_h1))
    story.append(
        Paragraph(
            "Điểm gốc áp dụng cho mỗi nội dung thi đấu được quy đổi theo tỷ lệ bậc thang chuẩn WKF như sau:",
            s_body,
        )
    )
    pts_table = Table(
        [
            [Paragraph("Thứ hạng / Thành tích", s_th), Paragraph("Ký hiệu", s_th), Paragraph("Điểm gốc (× 1.0)", s_th), Paragraph("Ghi chú", s_th)],
            [Paragraph("Hạng 1 — Huy chương Vàng", s_td), Paragraph("<b>HCV</b>", s_td), Paragraph("<b>100 điểm</b>", s_td), Paragraph("Nhà vô địch nội dung", s_td)],
            [Paragraph("Hạng 2 — Huy chương Bạc", s_td), Paragraph("<b>HCB</b>", s_td), Paragraph("<b>70 điểm</b>", s_td), Paragraph("Á quân (thua trận Chung kết)", s_td)],
            [Paragraph("Đồng hạng 3 — Huy chương Đồng", s_td), Paragraph("<b>HCĐ</b>", s_td), Paragraph("<b>50 điểm</b>", s_td), Paragraph("Áp dụng cho cả 2 VĐV đồng hạng 3", s_td)],
            [Paragraph("Hạng 5 *(mở rộng)*", s_td), Paragraph("Top 5", s_td), Paragraph("30 điểm", s_td), Paragraph("Thua trận tranh HCĐ (khi áp dụng)", s_td)],
            [Paragraph("Hạng 7 *(mở rộng)*", s_td), Paragraph("Top 7", s_td), Paragraph("15 điểm", s_td), Paragraph("Thua vòng Repechage trước trận HCĐ", s_td)],
        ],
        colWidths=[54 * mm, 24 * mm, 36 * mm, 56 * mm],
    )
    pts_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
                ("BOX", (0, 0), (-1, -1), 0.8, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(pts_table)
    story.append(Spacer(1, 8 * mm))

    story.append(Paragraph("PHẦN III. CẤP ĐỘ GIẢI ĐẤU & HỆ SỐ NHÂN ĐIỂM", s_h1))
    story.append(
        Paragraph(
            "Tương tự cơ chế <i>Event Factor</i> của WKF, điểm chính thức nhận được tại mỗi giải bằng <b>Điểm gốc × Hệ số cấp giải</b>:",
            s_body,
        )
    )
    tier_table = Table(
        [
            [Paragraph("Cấp độ giải đấu", s_th), Paragraph("Hệ số", s_th), Paragraph("HCV", s_th), Paragraph("HCB", s_th), Paragraph("HCĐ", s_th)],
            [Paragraph("<b>Cấp 1:</b> Quốc gia / Quốc tế / Toàn quốc", s_td), Paragraph("<b>× 2.0</b>", s_td), Paragraph("<b>200 đ</b>", s_td), Paragraph("140 đ", s_td), Paragraph("100 đ", s_td)],
            [Paragraph("<b>Cấp 2:</b> Tỉnh / Thành phố / Khu vực / Cúp CLB mạnh", s_td), Paragraph("<b>× 1.5</b>", s_td), Paragraph("<b>150 đ</b>", s_td), Paragraph("105 đ", s_td), Paragraph("75 đ", s_td)],
            [Paragraph("<b>Cấp 3:</b> CLB / Sinh viên / Giải Mở rộng", s_td), Paragraph("<b>× 1.0</b>", s_td), Paragraph("<b>100 đ</b>", s_td), Paragraph("70 đ", s_td), Paragraph("50 đ", s_td)],
        ],
        colWidths=[78 * mm, 22 * mm, 24 * mm, 23 * mm, 23 * mm],
    )
    tier_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), RED),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
                ("BOX", (0, 0), (-1, -1), 0.8, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(tier_table)
    story.append(Spacer(1, 6 * mm))

    note_table = Table(
        [
            [
                Paragraph(
                    "<b>Cơ chế xác định cấp giải:</b> Hệ thống K-SPORT tự động gợi ý cấp giải dựa trên tên giải đấu khi tạo mới hoặc đồng bộ. Tuy nhiên, <b>Ban Tổ Chức / Quản trị viên (Admin)</b> có toàn quyền kiểm tra và chỉnh lại cấp giải chính xác trên phần mềm K-SPORT Desktop hoặc tại cổng quản trị trước khi công bố bảng xếp hạng.",
                    s_td,
                )
            ]
        ],
        colWidths=[170 * mm],
    )
    note_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), AMBER_BG),
                ("BOX", (0, 0), (-1, -1), 0.8, AMBER_BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(note_table)
    story.append(PageBreak())

    # --- PAGE 4: TIE BREAK & EXAMPLES ---
    story.append(Paragraph("PHẦN IV. QUY TẮC PHÂN ĐỊNH KHI BẰNG ĐIỂM (TIE-BREAK)", s_h1))
    story.append(
        Paragraph(
            "Khi hai hoặc nhiều vận động viên có cùng tổng điểm trên bảng xếp hạng, thứ tự ưu tiên được xác định lần lượt theo đúng quy tắc WKF:",
            s_body,
        )
    )
    story.append(
        Paragraph(
            "1. Vận động viên có số <b>Huy chương Vàng (HCV)</b> nhiều hơn xếp trên.<br/>"
            "2. Nếu số HCV bằng nhau → xét số <b>Huy chương Bạc (HCB)</b> nhiều hơn.<br/>"
            "3. Nếu số HCB tiếp tục bằng nhau → xét số <b>Huy chương Đồng (HCĐ)</b> nhiều hơn.<br/>"
            "4. Nếu vẫn bằng nhau hoàn toàn → xếp đồng hạng.",
            s_body,
        )
    )
    story.append(Spacer(1, 6 * mm))

    story.append(Paragraph("PHẦN V. VÍ DỤ MINH HỌA TÍNH ĐIỂM", s_h1))
    story.append(
        Paragraph(
            "Giả sử một vận động viên thi đấu trong năm 2026 và đạt các thành tích sau:",
            s_body,
        )
    )
    ex_table = Table(
        [
            [Paragraph("Giải đấu tham dự", s_th), Paragraph("Cấp giải", s_th), Paragraph("Thành tích", s_th), Paragraph("Cách tính", s_th), Paragraph("Điểm nhận", s_th)],
            [Paragraph("Giải Karate Sinh viên Huế mở rộng 2026", s_td), Paragraph("CLB / Mở rộng (× 1.0)", s_td), Paragraph("1 HCV", s_td), Paragraph("100 × 1.0", s_td), Paragraph("<b>100 điểm</b>", s_td)],
            [Paragraph("Cúp các CLB Karate mạnh Toàn quốc 2026", s_td), Paragraph("Cúp CLB mạnh (× 1.5)", s_td), Paragraph("1 HCĐ", s_td), Paragraph("50 × 1.5", s_td), Paragraph("<b>75 điểm</b>", s_td)],
            [Paragraph("<b>TỔNG CỘNG MÙA GIẢI 2026</b>", s_td), Paragraph("—", s_td), Paragraph("<b>1 HCV, 1 HCĐ</b>", s_td), Paragraph("100 + 75", s_td), Paragraph("<b>175 điểm</b>", s_td)],
        ],
        colWidths=[54 * mm, 36 * mm, 26 * mm, 26 * mm, 28 * mm],
    )
    ex_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("BACKGROUND", (0, -1), (-1, -1), LIGHT_BG),
                ("BOX", (0, 0), (-1, -1), 0.8, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(ex_table)
    story.append(Spacer(1, 10 * mm))

    story.append(
        Paragraph(
            "<i>Tài liệu này được công khai trên cổng thông tin chính thức <b>https://www.k-sport.net</b>. Mọi góp ý hoặc thắc mắc về quy chế tính điểm, vui lòng liên hệ Ban quản trị K-SPORT qua email <b>lienhe@k-sport.net</b>.</i>",
            s_body,
        )
    )

    doc.build(story, onFirstPage=draw_chrome, onLaterPages=draw_chrome)
    print(f"Generated: {OUT_PDF} ({OUT_PDF.stat().st_size} bytes)")


if __name__ == "__main__":
    build_pdf()
