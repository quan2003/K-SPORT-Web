import re
import fitz

def extract_pdf_translations(kumite_pdf: str, kata_pdf: str):
    def extract_one(path: str, count: int) -> dict[int, str]:
        doc = fitz.open(path)
        qs: dict[int, str] = {}
        pattern = re.compile(r"(?:^|\n)(\d{1,3})\n(.+)$", re.DOTALL)
        for p in doc:
            for b in p.get_text("blocks"):
                text = b[4].strip()
                if "Số\nTiếng Việt\n" in text:
                    text = text.split("Số\nTiếng Việt\n", 1)[1].strip()
                m = pattern.match(text)
                if m:
                    num = int(m.group(1))
                    content = re.sub(r"\s+", " ", m.group(2).strip())
                    if 1 <= num <= count:
                        qs[num] = content
        return qs

    kumite = extract_one(kumite_pdf, 246)
    kata = extract_one(kata_pdf, 132)
    return kumite, kata


def main():
    kumite_pdf = "data/wkf-exam/import/WKF_Kumite_CauHoi_TiengViet.pdf"
    kata_pdf = "data/wkf-exam/import/Kata_ParaKarate_CauHoi_TiengViet.pdf"
    kumite_dict, kata_dict = extract_pdf_translations(kumite_pdf, kata_pdf)

    print(f"Kumite extracted: {len(kumite_dict)} / 246")
    print(f"Kata extracted: {len(kata_dict)} / 132")
    assert len(kumite_dict) == 246, "Missing Kumite questions!"
    assert len(kata_dict) == 132, "Missing Kata questions!"

    output_path = "scripts/wkf-exam/translations_vi.py"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write('"""\n')
        f.write("WKF Referee Academy - Official Vietnamese Question Translations\n")
        f.write("Extracted directly from:\n")
        f.write("  - WKF_Kumite_CauHoi_TiengViet.pdf (246 questions, Kumite 07/2026.1)\n")
        f.write("  - Kata_ParaKarate_CauHoi_TiengViet.pdf (132 questions, Kata 07/2026)\n")
        f.write('"""\n\n')

        f.write("KUMITE_TRANSLATIONS_VI: dict[int, str] = {\n")
        for num in range(1, 247):
            escaped = kumite_dict[num].replace("\\", "\\\\").replace('"', '\\"')
            f.write(f'    {num}: "{escaped}",\n')
        f.write("}\n\n")

        f.write("KATA_TRANSLATIONS_VI: dict[int, str] = {\n")
        for num in range(1, 133):
            escaped = kata_dict[num].replace("\\", "\\\\").replace('"', '\\"')
            f.write(f'    {num}: "{escaped}",\n')
        f.write("}\n")

    print(f"Wrote {output_path} successfully!")


if __name__ == "__main__":
    main()

