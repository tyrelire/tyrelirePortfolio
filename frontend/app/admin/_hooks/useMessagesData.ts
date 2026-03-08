import { useCallback, useMemo, useState } from "react";
import { apiRequest } from "../_lib/api";
import type { ContactMessage } from "../_lib/types";

export function useMessagesData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadMessages = useCallback(
    async (options?: { keepLoadingOnFail?: boolean }): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiRequest<ContactMessage[]>("/api/contact", {
          method: "GET",
        });

        setMessages(data);
        setSelectedId((current) => {
          if (data.length === 0) {
            return null;
          }
          if (current !== null && data.some((item) => item.id === current)) {
            return current;
          }
          return data[0]?.id ?? null;
        });

        setLoading(false);
        return true;
      } catch (err) {
        const nextError =
          err instanceof Error ? err.message : "Failed to load messages";
        setError(nextError);
        if (!options?.keepLoadingOnFail) {
          setLoading(false);
        }
        return false;
      }
    },
    [],
  );

  const selectedMessage = useMemo(
    () => messages.find((item) => item.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const markAsRead = useCallback(
    async (id: number) => {
      setError(null);
      setMessage(null);
      try {
        await apiRequest<ContactMessage>(`/api/contact/${id}`, {
          method: "PUT",
          body: JSON.stringify({ status: "READ" }),
        });
        setMessage("Message marked as read");
        await loadMessages();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update message",
        );
      }
    },
    [loadMessages],
  );

  const removeMessage = useCallback(
    async (id: number) => {
      setError(null);
      setMessage(null);
      try {
        await apiRequest<void>(`/api/contact/${id}`, { method: "DELETE" });
        setMessage("Message deleted");
        await loadMessages();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete message",
        );
      }
    },
    [loadMessages],
  );

  return {
    loading,
    error,
    message,
    messages,
    selectedId,
    setSelectedId,
    selectedMessage,
    loadMessages,
    markAsRead,
    removeMessage,
  };
}
