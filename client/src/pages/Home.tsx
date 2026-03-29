import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "wouter";
import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import SectionView from "@/components/SectionView";
import QuickActions from "@/components/QuickActions";
import TableOfContents from "@/components/TableOfContents";
import Footer from "@/components/Footer";
import { guideData, homePageData } from "@/data/guideContent";

export default function Home() {
  const [activeSection, setActiveSection] = useState("intro");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const currentSection = guideData.find((s) => s.id === activeSection);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [, setLocation] = useLocation();

  const handleSearchResult = (sectionId: string) => {
    if (sectionId === "expiry-tracker" || sectionId === "cash-closing") {
      setLocation(sectionId === "expiry-tracker" ? "/expiry-tracker" : "/cash-closing");
    } else {
      setActiveSection(sectionId);
      setTimeout(() => {
        document.querySelector("main")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Sidebar activeSection={activeSection} onSectionClick={setActiveSection} />

      <div className="md:mr-64 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
          <div className="container py-4 md:py-6">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {homePageData.title}
                </h1>
                <p className="text-xl text-accent font-semibold">
                  {homePageData.subtitle}
                </p>
              </div>
              <SearchBar onResultClick={handleSearchResult} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container py-8 md:py-12">
          <div className="space-y-12">
            {/* Hero Section */}
            {activeSection === "intro" && (
              <div className="space-y-8">
                <div className="bg-gradient-to-l from-primary/10 to-accent/10 border border-border rounded-lg p-8 text-center">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    مرحباً بك في الدليل التشغيلي الموحد
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    {homePageData.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {homePageData.lastUpdated}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-primary mb-6">
                    الإجراءات السريعة
                  </h3>
                  <QuickActions onActionClick={handleSearchResult} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TableOfContents
                      activeSection={activeSection}
                      onSectionClick={setActiveSection}
                    />
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-bold text-primary mb-4">
                      معلومات سريعة
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-foreground">
                          عدد الأقسام
                        </p>
                        <p className="text-muted-foreground">
                          {homePageData.totalSections} قسم شامل
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          الغرض
                        </p>
                        <p className="text-muted-foreground">
                          مرجع تشغيلي موحد لجميع الأقسام
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          الاستخدام
                        </p>
                        <p className="text-muted-foreground">
                          تدريب وتوحيد الأداء اليومي
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Content */}
            {currentSection && activeSection !== "intro" && (
              <SectionView section={currentSection} />
            )}
          </div>
        </main>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-110 z-40"
            title="الرجوع للأعلى"
          >
            <ArrowUp className="h-6 w-6" />
          </button>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
