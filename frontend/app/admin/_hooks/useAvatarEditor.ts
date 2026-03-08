import {
  type ChangeEvent,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { fileToDataUrl, renderCroppedImage } from "../_lib/avatar";

export function useAvatarEditor() {
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{
    x: number;
    y: number;
    cropX: number;
    cropY: number;
  } | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);

  const openEditorFromFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      return "Please choose an image file";
    }

    const dataUrl = await fileToDataUrl(file);
    setEditorImage(dataUrl);
    setCropX(0);
    setCropY(0);
    setZoom(1);
    return null;
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const firstFile = event.dataTransfer.files[0];
    if (!firstFile) {
      return "No file dropped";
    }
    return await openEditorFromFile(firstFile);
  };

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const firstFile = event.target.files?.[0];
    event.target.value = "";
    if (!firstFile) {
      return "No file selected";
    }
    return await openEditorFromFile(firstFile);
  };

  const startDragging = (event: ReactMouseEvent<HTMLDivElement>) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY, cropX, cropY };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const onMouseMove = (event: globalThis.MouseEvent) => {
      const start = dragStartRef.current;
      if (!start) {
        return;
      }
      setCropX(start.cropX + (event.clientX - start.x));
      setCropY(start.cropY + (event.clientY - start.y));
    };

    const onMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const buildImageData = () =>
    renderCroppedImage({ image: imageRef.current, cropX, cropY, zoom });

  return {
    editorImage,
    setEditorImage,
    cropX,
    cropY,
    zoom,
    setZoom,
    isDragging,
    imageRef,
    startDragging,
    handleDrop,
    handleFileInput,
    buildImageData,
  };
}
