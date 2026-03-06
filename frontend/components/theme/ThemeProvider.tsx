"use client";

import React from "react";

type ThemeType = "light" | "dark";

type ThemeContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
  accent: string;
  setAccent: (c: string) => void;
};

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  accent: "#E81E2B",
  setAccent: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<ThemeType | undefined>(undefined);
  const [accent, setAccent] = React.useState<string>("#E81E2B");

  React.useEffect(() => {
    let initial: ThemeType = "light";
    try {
      const htmlTheme = document.documentElement.getAttribute("data-theme");
      if (htmlTheme === "dark" || htmlTheme === "light") {
        initial = htmlTheme;
      } else {
        const stored = window.localStorage.getItem("theme");
        if (stored === "dark" || stored === "light") {
          initial = stored;
        } else if (
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          initial = "dark";
        }
      }
    } catch (e) {}

    try {
      const storedAccent = window.localStorage.getItem("accent");
      if (storedAccent) {
        setAccent(storedAccent);
      } else if (typeof window !== "undefined") {
        const computed = getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-red")
          ?.trim();
        if (computed) setAccent(computed);
      }
    } catch (e) {}

    setTheme(initial);
  }, []);

  React.useEffect(() => {
    if (!theme) return;
    try {
      document.documentElement.setAttribute("data-theme", theme);
      window.localStorage.setItem("theme", theme);
    } catch (e) {}

    try {
      const root = document.documentElement;

      if (theme === "dark") {
        root.style.setProperty("--color-background", "#030305");
        root.style.setProperty("--panel-background", "#0b0b0c");
        root.style.setProperty("--color-foreground", "#ffffff");
      } else {
        root.style.setProperty("--color-background", "#ffffff");
        root.style.setProperty("--panel-background", "#ffffff");
        root.style.setProperty("--color-foreground", "#000000");
      }
    } catch (e) {}
  }, [theme, accent]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function setAccentColor(c: string) {
    setAccent(c);
    try {
      const root = document.documentElement;
      root.style.setProperty("--accent-red", c);
      window.localStorage.setItem("accent", c);
    } catch (e) {}
  }

  if (!theme) return null;

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, accent, setAccent: setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
