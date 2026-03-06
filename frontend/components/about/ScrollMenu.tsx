import React, { useState, useEffect } from "react";

const sectionIds = ["introduction", "work", "studies", "skills"];

export default function ScrollMenu({
  structure,
  scrollTo,
}: {
  structure: any[];
  scrollTo: (idx: number) => void;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const visible = structure
        .map((section, idx) =>
          section.display ? { idx, id: sectionIds[idx] } : null,
        )
        .filter((item): item is { idx: number; id: string } => item !== null);
      let minIdx = 0;
      let minTop = Infinity;
      visible.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top >= 0 && top < minTop) {
          minTop = top;
          minIdx = i;
        }
      });
      setActiveIdx(minIdx);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [structure]);

  return (
    <nav className="hidden md:flex flex-col gap-4 px-6 py-12 min-w-[180px] max-w-[220px] h-fit sticky top-1/2 -translate-y-1/2 self-start">
      {structure
        .filter((s) => s.display)
        .map((section, idx) => (
          <button
            key={section.title}
            onClick={() => {
              let realIdx = 0,
                found = 0;
              for (let i = 0; i < structure.length; i++) {
                if (structure[i].display) {
                  if (found === idx) {
                    realIdx = i;
                    break;
                  }
                  found++;
                }
              }
              scrollTo(realIdx);
            }}
            className={`group relative text-left font-medium transition-all py-1
              ${activeIdx === idx ? "text-accent opacity-100 translate-x-3" : "opacity-60 hover:opacity-100 hover:translate-x-2"}
            `}
            style={{
              outline: "none",
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <span className="relative z-10">- {section.title}</span>
          </button>
        ))}
    </nav>
  );
}
