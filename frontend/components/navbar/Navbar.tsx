"use client";

import * as React from "react";
import { SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "../theme/ThemeProvider";
import DropdownMenuBurger from "../dropdown/Dropdown";
import { usePathname } from "next/navigation";

type NavbarCategory = {
  label: string;
  route: string;
};

type NavbarProps = {
  categories: NavbarCategory[];
};

export function Navbar({ categories }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = React.useState("");
  const pathname = usePathname();
  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex h-16 items-center justify-between px-4 md:px-8 border-b border-solid transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-black/40 border-white/[.145]"
            : "bg-white/30 border-black/[.08]"
        }
      `}
      style={{
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
      }}
    >
      <a href="/" className="flex items-center gap-2">
        <img
          src={theme === "dark" ? "/jester-logo-light.png" : "/jester-logo-dark.png"}
          alt="Logo"
          className="h-18 w-18"
        />
      </a>
      <nav className="hidden md:flex gap-8">
        {categories.map((cat) => {
          const isActive = pathname === cat.route;
          return (
            <div key={cat.route} className="flex flex-col items-center group">
              <a
                href={cat.route}
                className={`text-base font-medium transition-colors duration-200 px-1
                  ${theme === "dark" ? "text-zinc-50" : "text-black"}
                  ${isActive ? "font-bold" : "hover:opacity-80"}`}
              >
                {cat.label}
              </a>
              <span
                style={{ background: "var(--accent-red)" }}
                className={`block w-12 h-1 rounded-full mt-1 transition-transform duration-300 origin-center
                  ${isActive ? "scale-x-100 group-hover:scale-x-125" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </div>
          );
        })}
      </nav>
      <div className="flex md:hidden items-center absolute right-0 top-0 h-16 px-4 gap-2">
        <button
          aria-label="Toggle theme"
          className={`p-2 rounded transition-colors duration-200
            ${theme === "dark" ? "dark:hover:bg-zinc-800" : "hover:bg-zinc-200"}`}
          onClick={toggleTheme}
        >
          <SunIcon
            width={22}
            height={22}
            className={theme === "dark" ? "text-zinc-50" : "text-black"}
          />
        </button>
        <DropdownMenuBurger categories={categories} />
      </div>
      <button
        aria-label="Toggle theme"
        className={`ml-2 p-2 rounded transition-colors duration-200 hidden md:block
          ${theme === "dark" ? "dark:hover:bg-zinc-800" : "hover:bg-zinc-200"}`}
        onClick={toggleTheme}
      >
        <SunIcon
          width={22}
          height={22}
          className={theme === "dark" ? "text-zinc-50" : "text-black"}
        />
      </button>
    </header>
  );
}
