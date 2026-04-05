import { guideData } from "@/data/guideContent";

interface TableOfContentsProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export default function TableOfContents({
  activeSection,
  onSectionClick,
}: TableOfContentsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-2xl font-bold text-primary mb-4">فهرس المحتويات</h2>
      <div className="space-y-2">
        {[...guideData].sort((a, b) => a.order - b.order).map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={`w-full text-right px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
              activeSection === section.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <div className="flex items-center justify-end gap-2">
              <span>{section.title}</span>
              <span className="text-lg">{section.icon}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
