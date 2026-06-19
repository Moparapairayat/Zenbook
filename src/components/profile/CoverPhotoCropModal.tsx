import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Cropper, { Area } from "react-easy-crop";
import { X, Check, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverPhotoCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg", 0.92);
  });
}

const CoverPhotoCropModal = ({ imageSrc, onCropComplete, onCancel }: CoverPhotoCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropDone = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch {
      setSaving(false);
    }
  };

  const saveDisabled = saving || !croppedAreaPixels;

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/90 flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm z-10">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/80 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
          Cancel
        </Button>
        <h3 className="text-white font-semibold text-sm">Crop Cover Photo</h3>
        <Button size="sm" onClick={handleSave} disabled={saveDisabled}>
          <Check className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={16 / 5}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropDone}
          showGrid
          style={{
            containerStyle: { background: "#000" },
          }}
        />
      </div>

      {/* Controls */}
      <div className="shrink-0 px-4 py-3 bg-black/75 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-5">
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-white/60" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-36 sm:w-48 accent-primary"
              />
              <ZoomIn className="w-4 h-4 text-white/60" />
            </div>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/20 px-3 text-xs text-white/80 transition-colors hover:text-white"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Rotate
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-white/80 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveDisabled} className="min-w-[128px]">
              <Check className="w-4 h-4" />
              {saving ? "Saving..." : "Save Cover"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CoverPhotoCropModal;
