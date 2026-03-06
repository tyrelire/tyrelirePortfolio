import React, { useState } from "react";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const MAX_MESSAGE_LENGTH = 500;

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const SUBJECT_MAX_LENGTH = 100;

  const charsLeft = MAX_MESSAGE_LENGTH - message.length;
  const isMessageTooLong = charsLeft < 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
      <div
        className={`relative rounded-2xl border shadow-lg transition-colors duration-200
            bg-white/30 dark:bg-black/40
            border-black/[.08] dark:border-white/[.145]
            backdrop-blur-[3px] p-4 sm:p-6 w-full max-w-xs sm:max-w-md box-border overflow-x-hidden flex flex-col min-w-0
          `}
        style={{
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
          WebkitBackdropFilter: "blur(3px)",
          backdropFilter: "blur(3px)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-neutral-400 hover:text-[#e63946] text-3xl font-bold focus:outline-none"
          aria-label="Fermer"
          style={{ lineHeight: 1 }}
        >
          ×
        </button>
        <h3
          className="text-base sm:text-lg font-bold mb-4"
          style={{ color: "var(--accent-blue)" }}
        >
          Me contacter par email
        </h3>
        <form className="flex flex-col gap-3 min-w-0">
          <div className="flex flex-col w-full">
            <label
              htmlFor="contact-email"
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block"
            >
              Votre email <span className="text-[#e63946]">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              className={`rounded border ${emailError ? "border-[#e63946]" : "border-neutral-300 dark:border-neutral-700"} bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946] box-border min-w-0 w-full`}
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                const re =
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                setEmailError(
                  e.target.value && !re.test(e.target.value)
                    ? "Adresse email invalide"
                    : "",
                );
              }}
              required
              maxLength={254}
              pattern="^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$"
              autoComplete="email"
            />
            {emailError && (
              <span className="text-xs text-[#e63946] mt-1">{emailError}</span>
            )}
          </div>
          <div className="flex flex-col w-full">
            <label
              htmlFor="contact-subject"
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block"
            >
              Sujet <span className="text-[#e63946]">*</span>
            </label>
            <input
              id="contact-subject"
              type="text"
              className="rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946] box-border min-w-0 w-full"
              placeholder="Sujet du message"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={SUBJECT_MAX_LENGTH}
            />
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-right">
              {subject.length}/{SUBJECT_MAX_LENGTH} caractères
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label
              htmlFor="contact-message"
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block"
            >
              Message <span className="text-[#e63946]">*</span>
            </label>
            <textarea
              id="contact-message"
              className="rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946] resize-none box-border min-w-0 w-full"
              placeholder="Votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH + 100}
              rows={5}
              required
            />
            <div
              className={`text-xs mt-1 text-right ${isMessageTooLong ? "text-[#e63946]" : "text-neutral-500 dark:text-neutral-400"}`}
            >
              {message.length}/{MAX_MESSAGE_LENGTH} caractères
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e63946] text-white font-semibold shadow hover:bg-[#c71c2b] transition-colors text-sm sm:text-base disabled:opacity-60"
            disabled={
              !email || !subject || !message || isMessageTooLong || !!emailError
            }
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
