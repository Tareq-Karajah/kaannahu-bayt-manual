import { Printer } from "lucide-react";
import { GuideSection } from "@/data/guideContent";

interface PrintButtonProps {
  section: GuideSection;
}

export default function PrintButton({ section }: PrintButtonProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${section.title}</title>
        <style>
          * {
            font-family: 'Vazirmatn', Arial, sans-serif;
            direction: rtl;
            text-align: right;
          }
          body {
            margin: 20px;
            color: #3D3D3D;
            line-height: 1.6;
          }
          h1 {
            color: #8B9D6F;
            border-bottom: 3px solid #C9A876;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #8B9D6F;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          h3 {
            color: #A8956D;
            margin-top: 15px;
            margin-bottom: 8px;
          }
          p {
            margin-bottom: 10px;
          }
          ul, ol {
            margin-bottom: 15px;
            margin-right: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th {
            background-color: #8B9D6F;
            color: white;
            padding: 10px;
            text-align: right;
            border: 1px solid #ccc;
          }
          td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .note {
            background-color: #FFF8E7;
            border-left: 4px solid #C9A876;
            padding: 10px;
            margin: 15px 0;
            border-right: 4px solid #C9A876;
            border-left: none;
          }
          .step {
            background-color: #f5f1e8;
            padding: 10px;
            margin: 10px 0;
            border-right: 4px solid #8B9D6F;
          }
          .step-number {
            display: inline-block;
            width: 30px;
            height: 30px;
            background-color: #8B9D6F;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            margin-left: 10px;
            font-weight: bold;
          }
          .page-break {
            page-break-after: always;
          }
          @media print {
            body {
              margin: 0;
              padding: 10mm;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>${section.title}</h1>
        <p><strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString("ar-SA")}</p>
        
        ${
          section.content.introduction
            ? `<p>${section.content.introduction}</p>`
            : ""
        }

        ${
          section.content.keyPoints && section.content.keyPoints.length > 0
            ? `
          <h2>النقاط الرئيسية</h2>
          <ul>
            ${section.content.keyPoints.map((point) => `<li>${point}</li>`).join("")}
          </ul>
        `
            : ""
        }

        ${
          section.content.steps && section.content.steps.length > 0
            ? `
          <h2>الخطوات</h2>
          ${section.content.steps
            .map(
              (step) => `
            <div class="step">
              <span class="step-number">${step.number}</span>
              <strong>${step.title}</strong>
              <p>${step.description}</p>
              ${
                step.tips && step.tips.length > 0
                  ? `<ul>${step.tips.map((tip) => `<li>💡 ${tip}</li>`).join("")}</ul>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        `
            : ""
        }

        ${
          section.content.importantNotes &&
          section.content.importantNotes.length > 0
            ? `
          <h2>ملاحظات مهمة</h2>
          ${section.content.importantNotes
            .map((note) => `<div class="note">⚠️ ${note}</div>`)
            .join("")}
        `
            : ""
        }

        ${
          section.content.tables && section.content.tables.length > 0
            ? `
          <h2>الجداول</h2>
          ${section.content.tables
            .map(
              (table) => `
            ${table.title ? `<h3>${table.title}</h3>` : ""}
            <table>
              <thead>
                <tr>
                  ${table.headers.map((header) => `<th>${header}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${table.rows
                  .map(
                    (row) => `
                  <tr>
                    ${row.map((cell) => `<td>${cell}</td>`).join("")}
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
            )
            .join("")}
        `
            : ""
        }
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-all duration-300 ease-in-out"
      title="طباعة هذا القسم"
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">طباعة</span>
    </button>
  );
}
