"use client";

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printBtcHtmlReport(options: {
  title: string;
  tournamentName: string;
  subtitle?: string;
  bodyHtml: string;
  landscape?: boolean;
}) {
  const { title, tournamentName, subtitle, bodyHtml, landscape = false } = options;

  const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)} - ${escapeHtml(tournamentName)}</title>
  <style>
    @page {
      size: ${landscape ? "A4 landscape" : "A4 portrait"};
      margin: 12mm 14mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Times New Roman", "Segoe UI", Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-size: 13px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-brand {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 14px;
      font-size: 11px;
      color: #475569;
    }
    .report-brand strong {
      color: #dc2626;
      font-size: 13px;
      letter-spacing: 0.04em;
    }
    h1.report-title {
      text-align: center;
      text-transform: uppercase;
      font-size: 20px;
      margin: 0 0 4px;
      font-weight: 700;
      color: #0f172a;
    }
    h2.report-tournament {
      text-align: center;
      font-size: 14px;
      margin: 0 0 14px;
      font-weight: 700;
      font-style: italic;
      color: #1e293b;
    }
    p.report-subtitle {
      text-align: center;
      font-size: 12px;
      color: #475569;
      margin: -8px 0 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12.5px;
    }
    thead { display: table-header-group; }
    tfoot { display: table-row-group; }
    tr { page-break-inside: avoid; }
    th, td {
      border: 1px solid #334155;
      padding: 6px 8px;
      vertical-align: middle;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      text-align: center;
    }
    .group-block {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .group-heading {
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 6px;
      color: #0f172a;
      page-break-after: avoid;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: 700; }
    .bg-cb { background: #fef3c7; color: #92400e; font-weight: 700; }
    .bg-vdv { background: #dcfce7; color: #15803d; font-weight: 700; }
    .bg-total { background: #e0f2fe; color: #0369a1; font-weight: 800; }
    .row-grand-total td { background: #fef9c3; font-weight: 800; }
    .report-footer {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      font-size: 12px;
      color: #334155;
    }
    .signature-box {
      text-align: center;
      min-width: 200px;
    }
  </style>
</head>
<body>
  <div class="report-brand">
    <span><strong>K-SPORT</strong> · Hệ thống Điều hành Giải đấu Karate</span>
    <span>Xuất lúc: ${escapeHtml(new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()))}</span>
  </div>
  <h1 class="report-title">${escapeHtml(title)}</h1>
  <h2 class="report-tournament">${escapeHtml(tournamentName)}</h2>
  ${subtitle ? `<p class="report-subtitle">${escapeHtml(subtitle)}</p>` : ""}
  ${bodyHtml}
  <div class="report-footer">
    <div class="signature-box">
      <div><strong>TM. BAN TỔ CHỨC GIẢI</strong></div>
      <div style="margin-top: 4px; font-style: italic; color: #64748b;">(Ký, ghi rõ họ tên)</div>
    </div>
  </div>
</body>
</html>`;

  const printFrame = document.createElement("iframe");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";
  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
  if (!frameDoc || !printFrame.contentWindow) {
    document.body.removeChild(printFrame);
    return;
  }

  frameDoc.open();
  frameDoc.write(fullHtml);
  frameDoc.close();

  setTimeout(() => {
    try {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      }, 1500);
    }
  }, 250);
}

export { escapeHtml };

