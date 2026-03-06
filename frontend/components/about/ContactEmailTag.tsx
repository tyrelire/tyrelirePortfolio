import React, { useState } from "react";
import { Icon } from "@iconify/react";

export default function ContactEmailTag() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 backdrop-blur text-sm font-medium gap-2 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#e63946]"
        style={{
          background: "var(--panel-background)",
          color: "var(--accent-blue)",
        }}
        aria-label="Me contacter par email"
      >
        <Icon icon="mdi:email-outline" width={20} height={20} />
        <span>Me contacter</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-4 sm:p-6 min-w-[90vw] max-w-[95vw] sm:min-w-[320px] sm:max-w-[90vw] border border-neutral-200 dark:border-neutral-700 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-neutral-400 hover:text-[#e63946] text-xl font-bold focus:outline-none"
              aria-label="Fermer"
            >
              ×
            </button>
            <h3
              className="text-base sm:text-lg font-bold mb-2"
              style={{ color: "var(--accent-blue)" }}
            >
              Me contacter par email
            </h3>
            <p className="mb-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
              Clique sur le bouton ci-dessous pour m’envoyer un email :
            </p>
            <a
              href="mailto:benjamin.migliani@epitech.eu"
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-[#e63946] text-white font-semibold shadow hover:bg-[#c71c2b] transition-colors text-sm sm:text-base"
            >
              <Icon icon="mdi:email-send-outline" width={18} height={18} />
              Envoyer un email
            </a>
          </div>
        </div>
      )}
    </>
  );
}
