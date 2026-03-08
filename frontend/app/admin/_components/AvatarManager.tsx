import type { ChangeEvent, DragEvent, MouseEvent, RefObject } from "react";
import type { AvatarHistoryItem } from "../_lib/types";
import { resolveAvatarUrl } from "../_lib/helpers";

type AvatarEditorState = {
  editorImage: string | null;
  cropX: number;
  cropY: number;
  zoom: number;
  isDragging: boolean;
  imageRef: RefObject<HTMLImageElement | null>;
};

export function AvatarManager(props: {
  avatarHistory: AvatarHistoryItem[];
  onUseHistoryAvatar: (id: string) => Promise<void>;
  onDeleteHistoryAvatar: (id: string) => Promise<void>;
  onDropImage: (event: DragEvent<HTMLDivElement>) => Promise<string | null>;
  onFileImage: (event: ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  avatarEditor: AvatarEditorState;
  onStartDragging: (event: MouseEvent<HTMLDivElement>) => void;
  onZoomChange: (zoom: number) => void;
  onCancelEditor: () => void;
  onUploadCropped: () => Promise<void>;
  isUploadingAvatar: boolean;
}) {
  const a = props.avatarEditor;

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <h3 className="text-base font-semibold">Avatar Manager</h3>
      <div
        className="rounded-lg border border-dashed p-4 text-sm opacity-90"
        onDrop={(event) => {
          void props.onDropImage(event);
        }}
        onDragOver={(event) => event.preventDefault()}
      >
        <p>Drag and drop an image here, or choose a file.</p>
        <label className="inline-block mt-3 rounded border px-3 py-1.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10">
          Choose image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void props.onFileImage(event);
            }}
          />
        </label>
      </div>

      {a.editorImage && (
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Crop editor</p>
          <div className="relative mx-auto h-[280px] w-[280px] overflow-hidden rounded-full border bg-zinc-900">
            <div
              className={`absolute inset-0 ${a.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
              onMouseDown={props.onStartDragging}
            >
              <img
                ref={a.imageRef}
                src={a.editorImage}
                alt="Avatar crop source"
                draggable={false}
                className="absolute top-1/2 left-1/2 select-none pointer-events-none"
                style={{
                  transform: `translate(calc(-50% + ${a.cropX}px), calc(-50% + ${a.cropY}px)) scale(${a.zoom})`,
                  transformOrigin: "center center",
                  maxWidth: "none",
                  maxHeight: "none",
                  width: "280px",
                  height: "280px",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 ring-2 ring-white/80 rounded-full" />
          </div>

          <div>
            <label className="text-sm block mb-1">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={a.zoom}
              onChange={(event) =>
                props.onZoomChange(Number(event.target.value))
              }
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void props.onUploadCropped();
              }}
              disabled={props.isUploadingAvatar}
              className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm disabled:opacity-60"
            >
              {props.isUploadingAvatar
                ? "Uploading..."
                : "Upload cropped avatar"}
            </button>
            <button
              type="button"
              onClick={props.onCancelEditor}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Avatar history</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {props.avatarHistory.map((item) => (
            <article key={item.id} className="rounded-lg border p-2 space-y-2">
              <img
                src={resolveAvatarUrl(item.url)}
                alt="Avatar history item"
                className="w-full aspect-square rounded object-cover"
              />
              <p className="text-[11px] opacity-70">
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs border rounded px-2 py-1"
                  onClick={() => {
                    void props.onUseHistoryAvatar(item.id);
                  }}
                >
                  Use
                </button>
                <button
                  type="button"
                  className="text-xs border rounded px-2 py-1"
                  onClick={() => {
                    void props.onDeleteHistoryAvatar(item.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
