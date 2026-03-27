import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { guideData } from "@/data/guideContent";

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  subsectionId?: string;
  subsectionTitle?: string;
  matchType: "title" | "content" | "keyPoint";
  matchText: string;
}

interface SearchBarProps {
  onResultClick?: (sectionId: string, subsectionId?: string) => void;
}

export default function SearchBar({ onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const foundResults: SearchResult[] = [];

    // Search through all sections
    guideData.forEach((section) => {
      // Search in section title
      if (section.title.toLowerCase().includes(searchTerm)) {
        foundResults.push({
          sectionId: section.id,
          sectionTitle: section.title,
          matchType: "title",
          matchText: section.title,
        });
      }

      // Search in section content
      if (section.content.introduction?.toLowerCase().includes(searchTerm)) {
        foundResults.push({
          sectionId: section.id,
          sectionTitle: section.title,
          matchType: "content",
          matchText: section.content.introduction.substring(0, 100) + "...",
        });
      }

      // Search in key points
      section.content.keyPoints?.forEach((point) => {
        if (point.toLowerCase().includes(searchTerm)) {
          foundResults.push({
            sectionId: section.id,
            sectionTitle: section.title,
            matchType: "keyPoint",
            matchText: point.substring(0, 100) + (point.length > 100 ? "..." : ""),
          });
        }
      });

      // Search in subsections
      section.content.subsections?.forEach((subsection) => {
        if (subsection.title.toLowerCase().includes(searchTerm)) {
          foundResults.push({
            sectionId: section.id,
            sectionTitle: section.title,
            subsectionId: subsection.id,
            subsectionTitle: subsection.title,
            matchType: "title",
            matchText: subsection.title,
          });
        }

        if (
          subsection.content.introduction?.toLowerCase().includes(searchTerm)
        ) {
          foundResults.push({
            sectionId: section.id,
            sectionTitle: section.title,
            subsectionId: subsection.id,
            subsectionTitle: subsection.title,
            matchType: "content",
            matchText:
              subsection.content.introduction.substring(0, 100) + "...",
          });
        }

        subsection.content.keyPoints?.forEach((point) => {
          if (point.toLowerCase().includes(searchTerm)) {
            foundResults.push({
              sectionId: section.id,
              sectionTitle: section.title,
              subsectionId: subsection.id,
              subsectionTitle: subsection.title,
              matchType: "keyPoint",
              matchText: point.substring(0, 100) + (point.length > 100 ? "..." : ""),
            });
          }
        });
      });
    });

    setResults(foundResults.slice(0, 10)); // Limit to 10 results
    setIsOpen(true);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result.sectionId, result.subsectionId);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="ابحث في الدليل..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="w-full pr-10 pl-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-all duration-300 ease-in-out"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full text-right p-3 hover:bg-secondary rounded-md transition-all duration-300 ease-in-out mb-1 last:mb-0 border border-transparent hover:border-border"
              >
                <div className="text-sm font-semibold text-primary">
                  {result.sectionTitle}
                </div>
                {result.subsectionTitle && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {result.subsectionTitle}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {result.matchText}
                </div>
              </button>
            ))}
          </div>
          {results.length === 10 && (
            <div className="p-2 text-center text-xs text-muted-foreground border-t border-border">
              تم عرض أول 10 نتائج
            </div>
          )}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
          لم يتم العثور على نتائج
        </div>
      )}
    </div>
  );
}
