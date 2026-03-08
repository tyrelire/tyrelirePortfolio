import { API_BASE_URL } from "./constants";

export function resolveAvatarUrl(url: string): string {
  return url.startsWith("/uploads/") ? `${API_BASE_URL}${url}` : url;
}

export function toTrimmedLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
