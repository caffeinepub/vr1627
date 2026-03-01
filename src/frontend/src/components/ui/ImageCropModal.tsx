import { Button } from "@/components/ui/button";
import { Check, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  file: File;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  file,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
  });
  const [scale, setScale] = useState(1);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // When image loads, set initial crop to full image
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img || !containerRef.current) return;
    const container = containerRef.current;
    const maxW = container.clientWidth - 32;
    const maxH = 420;
    const ratio = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight,
      1,
    );
    const dw = Math.round(img.naturalWidth * ratio);
    const dh = Math.round(img.naturalHeight * ratio);
    setScale(ratio);
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplaySize({ w: dw, h: dh });
    // Default crop = full image
    setCrop({ x: 0, y: 0, width: dw, height: dh });
  }, []);

  // Draw canvas overlay
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Darken outside crop
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear inside crop (show image)
    ctx.clearRect(crop.x, crop.y, crop.width, crop.height);

    // Crop border
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // Rule-of-thirds grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(crop.x + (crop.width / 3) * i, crop.y);
      ctx.lineTo(crop.x + (crop.width / 3) * i, crop.y + crop.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crop.x, crop.y + (crop.height / 3) * i);
      ctx.lineTo(crop.x + crop.width, crop.y + (crop.height / 3) * i);
      ctx.stroke();
    }

    // Corner handles
    const handleSize = 10;
    const handles = [
      { id: "nw", x: crop.x, y: crop.y },
      { id: "ne", x: crop.x + crop.width, y: crop.y },
      { id: "sw", x: crop.x, y: crop.y + crop.height },
      { id: "se", x: crop.x + crop.width, y: crop.y + crop.height },
    ];
    ctx.fillStyle = "white";
    for (const h of handles) {
      ctx.fillRect(
        h.x - handleSize / 2,
        h.y - handleSize / 2,
        handleSize,
        handleSize,
      );
    }
  }, [crop]);

  useEffect(() => {
    if (displaySize.w > 0) drawOverlay();
  }, [displaySize, drawOverlay]);

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const getHandle = (x: number, y: number) => {
    const threshold = 12;
    if (Math.abs(x - crop.x) < threshold && Math.abs(y - crop.y) < threshold)
      return "nw";
    if (
      Math.abs(x - (crop.x + crop.width)) < threshold &&
      Math.abs(y - crop.y) < threshold
    )
      return "ne";
    if (
      Math.abs(x - crop.x) < threshold &&
      Math.abs(y - (crop.y + crop.height)) < threshold
    )
      return "sw";
    if (
      Math.abs(x - (crop.x + crop.width)) < threshold &&
      Math.abs(y - (crop.y + crop.height)) < threshold
    )
      return "se";
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    const handle = getHandle(pos.x, pos.y);
    if (handle) {
      setIsResizing(handle);
      setDragStart({ x: pos.x, y: pos.y, cropX: crop.x, cropY: crop.y });
    } else if (
      pos.x >= crop.x &&
      pos.x <= crop.x + crop.width &&
      pos.y >= crop.y &&
      pos.y <= crop.y + crop.height
    ) {
      setIsDragging(true);
      setDragStart({ x: pos.x, y: pos.y, cropX: crop.x, cropY: crop.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    if (!isDragging && !isResizing) return;

    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;

    if (isDragging) {
      const newX = Math.max(
        0,
        Math.min(displaySize.w - crop.width, dragStart.cropX + dx),
      );
      const newY = Math.max(
        0,
        Math.min(displaySize.h - crop.height, dragStart.cropY + dy),
      );
      setCrop((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      const minSize = 50;
      setCrop((prev) => {
        let { x, y, width, height } = prev;
        if (isResizing === "se") {
          width = Math.max(minSize, Math.min(displaySize.w - x, pos.x - x));
          height = Math.max(minSize, Math.min(displaySize.h - y, pos.y - y));
        } else if (isResizing === "sw") {
          const newX = Math.max(0, Math.min(x + width - minSize, pos.x));
          width = x + width - newX;
          x = newX;
          height = Math.max(minSize, Math.min(displaySize.h - y, pos.y - y));
        } else if (isResizing === "ne") {
          width = Math.max(minSize, Math.min(displaySize.w - x, pos.x - x));
          const newY = Math.max(0, Math.min(y + height - minSize, pos.y));
          height = y + height - newY;
          y = newY;
        } else if (isResizing === "nw") {
          const newX = Math.max(0, Math.min(x + width - minSize, pos.x));
          const newY = Math.max(0, Math.min(y + height - minSize, pos.y));
          width = x + width - newX;
          height = y + height - newY;
          x = newX;
          y = newY;
        }
        return { x, y, width, height };
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0, width: displaySize.w, height: displaySize.h });
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    // Convert display coords back to natural image coords
    const scaleX = naturalSize.w / displaySize.w;
    const scaleY = naturalSize.h / displaySize.h;

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = Math.round(crop.width * scaleX);
    outputCanvas.height = Math.round(crop.height * scaleY);
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      outputCanvas.width,
      outputCanvas.height,
    );

    outputCanvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      file.type || "image/jpeg",
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h3 className="font-semibold text-base">Crop Image</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag corners to resize, drag inside to move. This is how it will
              appear on the website.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop area */}
        <div
          ref={containerRef}
          className="p-4 bg-black/40 flex items-center justify-center min-h-[200px]"
        >
          {imgSrc && (
            <div
              className="relative select-none"
              style={{ width: displaySize.w, height: displaySize.h }}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop preview"
                className="block"
                style={{
                  width: displaySize.w,
                  height: displaySize.h,
                  objectFit: "fill",
                }}
                onLoad={handleImageLoad}
                draggable={false}
              />
              <canvas
                ref={canvasRef}
                width={displaySize.w}
                height={displaySize.h}
                className="absolute inset-0"
                style={{
                  cursor: isDragging
                    ? "grabbing"
                    : isResizing
                      ? "crosshair"
                      : "default",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          )}
          {!imgSrc && (
            <div className="text-muted-foreground text-sm">
              Loading image...
            </div>
          )}
        </div>

        {/* Crop info */}
        {displaySize.w > 0 && (
          <div className="px-5 py-2 bg-zinc-900/60 text-xs text-muted-foreground text-center border-t border-white/5">
            Crop size: {Math.round(crop.width / scale)} x{" "}
            {Math.round(crop.height / scale)} px
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/8">
          <button
            type="button"
            onClick={resetCrop}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm} className="gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Use this crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
