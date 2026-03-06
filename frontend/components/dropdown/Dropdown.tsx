import * as React from "react";
import { DropdownMenu } from "radix-ui";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

type Category = { label: string; route: string };
type DropdownMenuBurgerProps = {
  categories?: Category[];
  theme?: string;
};

const DropdownMenuBurger: React.FC<DropdownMenuBurgerProps> = ({
  categories = [],
  theme,
}) => {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const prevWidth = {
      current: typeof window !== "undefined" ? window.innerWidth : 1024,
    };

    function handleResize() {
      const w = window.innerWidth;
      const wasMobile = prevWidth.current < 768;
      const isDesktop = w >= 768;
      prevWidth.current = w;
      if (wasMobile && isDesktop) setOpen(false);
    }

    let raf = 0;
    const debounced = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(handleResize);
    };

    window.addEventListener("resize", debounced);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", debounced);
    };
  }, []);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center justify-center rounded-md p-2 transition-colors hover:bg-[#E81E2B]/10 focus:outline-none focus:ring-2 focus:ring-[#E81E2B] dark:hover:bg-neutral-800"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? (
            <Cross1Icon className="h-6 w-6" />
          ) : (
            <HamburgerMenuIcon className="h-6 w-6" />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className={`min-w-[220px] z-[9999] mr-4 rounded backdrop-blur-sm transition-colors duration-200 ${
          theme === "dark" ? "bg-black/40 text-white" : "bg-white/30 text-black"
        }`}
        sideOffset={5}
        style={{
          background:
            theme === "dark" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
          border:
            theme === "dark"
              ? "1px solid rgba(255,255,255,0.145)"
              : "1px solid rgba(0,0,0,0.08)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
        }}
      >
        {categories.length > 0 && (
          <div
            className={`flex flex-col divide-y ${
              theme === "dark" ? "divide-white/[.06]" : "divide-black/[.06]"
            }`}
          >
            {categories.map((cat, idx) => {
              const isActive = pathname === cat.route;
              const isFirst = idx === 0;
              const isLast = idx === categories.length - 1;
              return (
                <DropdownMenu.Item
                  key={cat.route}
                  className={`w-full p-3 text-base transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E81E2B] focus-visible:outline-none
                      ${isFirst ? "rounded-t" : ""}
                      ${isLast ? "rounded-b" : ""}
                      bg-[#030305]
                      ${isActive ? "text-white font-bold opacity-80" : "text-neutral-400 font-semibold hover:bg-[#18191C]"}
                    `}
                  asChild
                >
                  <a href={cat.route}>{cat.label}</a>
                </DropdownMenu.Item>
              );
            })}
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default DropdownMenuBurger;
