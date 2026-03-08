import { useCallback } from "react";
import { apiRequest } from "../_lib/api";
import type { AboutProfile, AvatarHistoryItem } from "../_lib/types";

type Params = {
  setError: (value: string | null) => void;
  setMessage: (value: string | null) => void;
  setIsUploadingAvatar: (value: boolean) => void;
  refresh: () => Promise<boolean>;
};

export function useAboutAvatarActions(p: Params) {
  const withRefresh = useCallback(
    async (action: () => Promise<void>, okMessage: string) => {
      p.setError(null);
      p.setMessage(null);
      try {
        await action();
        p.setMessage(okMessage);

        const scrollY = window.scrollY;
        await p.refresh();
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" });
        });
      } catch (err) {
        p.setError(err instanceof Error ? err.message : "Request failed");
      }
    },
    [p],
  );

  const uploadAvatar = (imageData: string) =>
    withRefresh(async () => {
      p.setIsUploadingAvatar(true);
      try {
        const uploaded = await apiRequest<AvatarHistoryItem>(
          "/api/about/profile/avatars",
          { method: "POST", body: JSON.stringify({ imageData }) },
        );
        await apiRequest<AboutProfile>("/api/about/profile", {
          method: "PUT",
          body: JSON.stringify({ avatar: uploaded.url }),
        });
      } finally {
        p.setIsUploadingAvatar(false);
      }
    }, "Avatar uploaded and applied");

  const useAvatarFromHistory = (id: string) =>
    withRefresh(async () => {
      await apiRequest<AboutProfile>(
        `/api/about/profile/avatars/${id}/select`,
        {
          method: "PUT",
        },
      );
    }, "Avatar applied");

  const deleteAvatar = (id: string) =>
    withRefresh(async () => {
      await apiRequest<{ success: boolean }>(
        `/api/about/profile/avatars/${id}`,
        {
          method: "DELETE",
        },
      );
    }, "Avatar removed");

  return { uploadAvatar, useAvatarFromHistory, deleteAvatar };
}
