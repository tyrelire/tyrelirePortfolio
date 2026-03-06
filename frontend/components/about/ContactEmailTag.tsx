import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ContactModal from "./ContactModal";

export default function ContactEmailTag() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:opacity-80 flex items-center px-2 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 backdrop-blur text-sm font-medium gap-2 transition-colors"
        style={{ textDecoration: 'none' }}
        aria-label="Me contacter par email"
      >
        <span className="block md:hidden"><Icon icon="mdi:email-outline" width={24} height={24} /></span>
        <span className="hidden md:block"><Icon icon="mdi:email-outline" width={32} height={32} /></span>
        <span>Me contacter</span>
      </button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
