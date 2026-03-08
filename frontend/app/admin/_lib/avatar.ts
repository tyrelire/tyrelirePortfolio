export async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read image"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export function renderCroppedImage(params: {
  image: HTMLImageElement | null;
  cropX: number;
  cropY: number;
  zoom: number;
}): string | null {
  const { image, cropX, cropY, zoom } = params;

  if (!image) {
    return null;
  }

  const frameSize = 280;
  const outputSize = 512;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const baseScale = Math.max(
    frameSize / image.naturalWidth,
    frameSize / image.naturalHeight,
  );
  const width = image.naturalWidth * baseScale * zoom;
  const height = image.naturalHeight * baseScale * zoom;
  const x = frameSize / 2 - width / 2 + cropX;
  const y = frameSize / 2 - height / 2 + cropY;

  context.scale(outputSize / frameSize, outputSize / frameSize);
  context.fillStyle = "#111";
  context.fillRect(0, 0, frameSize, frameSize);
  context.drawImage(image, x, y, width, height);

  return canvas.toDataURL("image/png", 0.92);
}
