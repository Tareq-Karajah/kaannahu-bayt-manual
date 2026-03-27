import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useState } from "react";
import { GuideSection, SubSection, SectionContent } from "@/data/guideContent";
import PrintButton from "./PrintButton";

interface SectionViewProps {
  section: GuideSection;
}

function ContentRenderer({ content }: { content: SectionContent }) {
  return (
    <div className="space-y-6">
      {content.introduction && (
        <div className="bg-secondary/50 border border-border rounded-lg p-4 text-justify">
          <p className="text-foreground leading-relaxed">{content.introduction}</p>
        </div>
      )}

      {content.keyPoints && content.keyPoints.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-primary mb-3">النقاط الرئيسية</h4>
          <ul className="space-y-2">
            {content.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-3 text-justify">
                <span className="text-primary font-bold flex-shrink-0 mt-1">•</span>
                <span className="text-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.steps && content.steps.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-primary mb-3">الخطوات</h4>
          <div className="space-y-3">
            {content.steps.map((step) => (
              <div key={step.number} className="bg-card border border-border rounded-lg p-4">
                <div className="flex gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {step.number}
                  </div>
                  <h5 className="font-semibold text-foreground">{step.title}</h5>
                </div>
                <p className="text-muted-foreground text-justify mr-11">{step.description}</p>
                {step.tips && step.tips.length > 0 && (
                  <div className="mt-3 mr-11 space-y-1">
                    {step.tips.map((tip, idx) => (
                      <p key={idx} className="text-sm text-accent font-medium">💡 {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {content.importantNotes && content.importantNotes.length > 0 && (
        <div className="bg-accent/10 border border-accent rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-accent flex items-center gap-2">
            <span>⚠️</span>
            ملاحظات مهمة
          </h4>
          <ul className="space-y-2">
            {content.importantNotes.map((note, index) => (
              <li key={index} className="flex gap-3 text-justify">
                <span className="text-accent font-bold flex-shrink-0 mt-1">→</span>
                <span className="text-foreground text-sm">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.tables && content.tables.length > 0 && (
        <div className="space-y-4">
          {content.tables.map((table, tableIdx) => (
            <div key={tableIdx}>
              {table.title && (
                <h4 className="text-lg font-semibold text-primary mb-3">{table.title}</h4>
              )}
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      {table.headers.map((header, idx) => (
                        <th key={idx} className="px-4 py-3 text-right font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={`border-t border-border ${
                          rowIdx % 2 === 0 ? "bg-card" : "bg-secondary/30"
                        }`}
                      >
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-3 text-right text-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {content.checklists && content.checklists.length > 0 && (
        <div className="space-y-4">
          {content.checklists.map((checklist, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-4">
              {checklist.title && (
                <h4 className="font-semibold text-primary mb-3">{checklist.title}</h4>
              )}
              <div className="space-y-2">
                {checklist.items.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-all duration-300 ease-in-out">
                    <input type="checkbox" className="w-4 h-4 rounded border-border" />
                    <span className="text-foreground text-sm">{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubSectionAccordion({ subsection }: { subsection: SubSection }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-secondary hover:bg-secondary/80 transition-all duration-300 ease-in-out flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-primary" />
          )}
          <h4 className="font-semibold text-foreground text-right">{subsection.title}</h4>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 bg-card border-t border-border">
          <ContentRenderer content={subsection.content} />
        </div>
      )}
    </div>
  );
}

export default function SectionView({ section }: SectionViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySection = () => {
    const text = `${section.title}\n\n${JSON.stringify(section.content, null, 2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className={`${section.color} border border-border rounded-lg p-6 md:p-8`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{section.icon}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {section.title}
              </h1>
            </div>
            {section.subtitle && (
              <p className="text-muted-foreground text-lg">{section.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PrintButton section={section} />
            <button
              onClick={handleCopySection}
              className="p-2 hover:bg-secondary rounded-lg transition-all duration-300 ease-in-out flex-shrink-0"
              title="نسخ القسم"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      <ContentRenderer content={section.content} />

      {section.content.subsections && section.content.subsections.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-primary">الأقسام الفرعية</h3>
          <div className="space-y-2">
            {section.content.subsections.map((subsection) => (
              <SubSectionAccordion key={subsection.id} subsection={subsection} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
