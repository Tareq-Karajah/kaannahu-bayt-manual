import { Menu, X } from "lucide-react";
import { useState } from "react";
import { guideData } from "@/data/guideContent";

interface SidebarProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export default function Sidebar({ activeSection, onSectionClick }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <nav className="space-y-1 p-4">
      {guideData.map((section) => (
        <button
          key={section.id}
          onClick={() => handleSectionClick(section.id)}
          className={`w-full text-right px-4 py-3 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-end gap-3 ${
            activeSection === section.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground hover:bg-secondary"
          }`}
        >
          <span className="font-medium text-sm md:text-base">
            {section.title}
          </span>
          <span className="text-lg">{section.icon}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-card border border-border rounded-lg hover:bg-secondary transition-all duration-300 ease-in-out"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-sidebar border-l border-border h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-primary">الأقسام</h2>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed right-0 top-0 bottom-0 w-64 bg-sidebar border-l border-border z-40 overflow-y-auto md:hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">الأقسام</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-all duration-300 ease-in-out"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
