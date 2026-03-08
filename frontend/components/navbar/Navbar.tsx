"use client";

import * as React from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useTheme } from "../theme/ThemeProvider";
import DropdownMenuBurger from "../dropdown/Dropdown";
import { usePathname } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const checkAdminSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        setIsAdminAuthenticated(response.ok);
      } catch {
        if (!cancelled) {
          setIsAdminAuthenticated(false);
        }
      }
    };

    void checkAdminSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const crownButtonClass = `p-2 rounded transition-colors duration-200 ${
    theme === "dark" ? "dark:hover:bg-zinc-800" : "hover:bg-zinc-200"
  }`;

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
          src={
            theme === "dark"
              ? "/jester-logo-light.png"
              : "/jester-logo-dark.png"
          }
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
                  ${theme === "dark" ? "text-white" : "text-black"}
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
          {theme === "light" ? (
            <MoonIcon width={22} height={22} className="text-black" />
          ) : (
            <SunIcon width={22} height={22} className="text-white" />
          )}
        </button>
        {isAdminAuthenticated && (
          <a
            href="/admin"
            aria-label="Open admin"
            title="Admin"
            className={crownButtonClass}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={theme === "dark" ? "text-white" : "text-black"}
            >
              <path d="M3 19h18" />
              <path d="M5 19 3 7l6 5 3-6 3 6 6-5-2 12H5Z" />
            </svg>
          </a>
        )}
        <DropdownMenuBurger categories={categories} />
      </div>
      <div className="hidden md:flex items-center gap-1">
        {isAdminAuthenticated && (
          <a
            href="/admin"
            aria-label="Open admin"
            title="Admin"
            className={crownButtonClass}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={theme === "dark" ? "text-white" : "text-black"}
            >
              <path d="M3 19h18" />
              <path d="M5 19 3 7l6 5 3-6 3 6 6-5-2 12H5Z" />
            </svg>
          </a>
        )}
        <button
          aria-label="Toggle theme"
          className={`ml-1 p-2 rounded transition-colors duration-200
            ${theme === "dark" ? "dark:hover:bg-zinc-800" : "hover:bg-zinc-200"}`}
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <MoonIcon width={22} height={22} className="text-black" />
          ) : (
            <SunIcon width={22} height={22} className="text-white" />
          )}
        </button>
      </div>
    </header>
  );
}
