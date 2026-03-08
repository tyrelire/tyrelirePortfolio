import { useEffect, useState } from "react";
import type { AdminTab } from "../_components/AdminTabs";

const ACTIVE_TAB_KEY = "admin.activeTab";
const scrollKey = (tab: AdminTab) => `admin.scrollY.${tab}`;

function getInitialTab(): AdminTab {
  if (typeof window === "undefined") {
    return "about";
  }

  try {
    const savedTab = window.sessionStorage.getItem(ACTIVE_TAB_KEY);
    if (
      savedTab === "about" ||
      savedTab === "messages" ||
      savedTab === "visitors"
    ) {
      return savedTab;
    }
  } catch {
    // Ignore storage failures.
  }

  return "about";
}

export function useAdminUiState() {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => getInitialTab());

  useEffect(() => {
    try {
      window.sessionStorage.setItem(ACTIVE_TAB_KEY, activeTab);
    } catch {
      // Ignore storage failures.
    }
  }, [activeTab]);

  useEffect(() => {
    const saveScroll = () => {
      try {
        window.sessionStorage.setItem(
          scrollKey(activeTab),
          String(window.scrollY),
        );
      } catch {
        // Ignore storage failures.
      }
    };

    window.addEventListener("scroll", saveScroll, { passive: true });

    return () => {
      saveScroll();
      window.removeEventListener("scroll", saveScroll);
    };
  }, [activeTab]);

  useEffect(() => {
    try {
      const savedScroll = window.sessionStorage.getItem(scrollKey(activeTab));
      const scrollY = Number(savedScroll);

      if (!Number.isFinite(scrollY) || scrollY < 0) {
        return;
      }

      let attempts = 0;
      const maxAttempts = 12;

      const restoreWhenReady = () => {
        const pageMaxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );

        if (pageMaxScroll >= scrollY || attempts >= maxAttempts) {
          window.scrollTo({
            top: Math.min(scrollY, pageMaxScroll),
            behavior: "auto",
          });
          return;
        }

        attempts += 1;
        window.requestAnimationFrame(restoreWhenReady);
      };

      window.requestAnimationFrame(restoreWhenReady);
    } catch {
      // Ignore storage failures.
    }
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
  };
}
