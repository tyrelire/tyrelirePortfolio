import React, { useState } from "react";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const MAX_MESSAGE_LENGTH = 500;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 140;
const MAX_MESSAGE_LENGTH_BACKEND = 4000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const HAS_DANGEROUS_MARKUP_REGEX = /<[^>]+>/;

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const SUBJECT_MAX_LENGTH = MAX_SUBJECT_LENGTH;
  const NAME_MAX_LENGTH = MAX_NAME_LENGTH;

  const charsLeft = MAX_MESSAGE_LENGTH - message.length;
  const isMessageTooLong = charsLeft < 0;

  const normalizedName = name.trim().replace(/\s+/g, " ");
  const normalizedEmail = email.trim().replace(/\s+/g, " ").toLowerCase();
  const normalizedSubject = subject.trim().replace(/\s+/g, " ");
  const normalizedMessage = message.trim();

  const validateBeforeSubmit = (): string | null => {
    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedSubject ||
      !normalizedMessage
    ) {
      return "Missing required fields";
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return "Invalid email";
    }

    if (
      normalizedName.length > MAX_NAME_LENGTH ||
      normalizedEmail.length > MAX_EMAIL_LENGTH ||
      normalizedSubject.length > MAX_SUBJECT_LENGTH ||
      normalizedMessage.length > MAX_MESSAGE_LENGTH_BACKEND
    ) {
      return "One or more fields are too long";
    }

    if (
      HAS_DANGEROUS_MARKUP_REGEX.test(normalizedName) ||
      HAS_DANGEROUS_MARKUP_REGEX.test(normalizedEmail) ||
      HAS_DANGEROUS_MARKUP_REGEX.test(normalizedSubject) ||
      HAS_DANGEROUS_MARKUP_REGEX.test(normalizedMessage)
    ) {
      return "Invalid content";
    }

    return null;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setWebsite("");
    setEmailError("");
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (emailError || isMessageTooLong) {
      setSubmitError("Please fix form errors before sending.");
      return;
    }

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          subject: normalizedSubject,
          message: normalizedMessage,
          website,
        }),
      });

      if (!response.ok) {
        let nextError = `Request failed: ${response.status}`;

        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            nextError = payload.error;
          }
        } catch {
          // Keep fallback error message when response body is not JSON.
        }

        throw new Error(nextError);
      }

      setSubmitSuccess("Message sent successfully.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setWebsite("");
      setEmailError("");
    } catch (error) {
      const nextError =
        error instanceof Error ? error.message : "Failed to send message";
      setSubmitError(nextError);
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={handleClose}
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
        <form
          className="flex flex-col gap-3 min-w-0"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col w-full">
            <label
              htmlFor="contact-name"
              className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block"
            >
              Votre nom <span className="text-[#e63946]">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              className="rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946] box-border min-w-0 w-full"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={NAME_MAX_LENGTH}
              autoComplete="name"
            />
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-right">
              {name.length}/{NAME_MAX_LENGTH} caracteres
            </div>
          </div>
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
                setEmailError(
                  e.target.value && !EMAIL_REGEX.test(e.target.value)
                    ? "Adresse email invalide"
                    : "",
                );
              }}
              required
              maxLength={MAX_EMAIL_LENGTH}
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
              {subject.length}/{SUBJECT_MAX_LENGTH} caracteres
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
              maxLength={MAX_MESSAGE_LENGTH_BACKEND}
              rows={5}
              required
            />
            <div
              className={`text-xs mt-1 text-right ${isMessageTooLong ? "text-[#e63946]" : "text-neutral-500 dark:text-neutral-400"}`}
            >
              {message.length}/{MAX_MESSAGE_LENGTH} caracteres
            </div>
          </div>

          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          {submitError && (
            <p className="text-xs text-[#e63946]">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-xs text-emerald-600">{submitSuccess}</p>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e63946] text-white font-semibold shadow hover:bg-[#c71c2b] transition-colors text-sm sm:text-base disabled:opacity-60"
            disabled={
              !name ||
              !email ||
              !subject ||
              !message ||
              isMessageTooLong ||
              !!emailError ||
              submitting
            }
          >
            {submitting ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}
