import { X } from "lucide-react";
import { useEffect } from "react";
import type { Video } from "../../backend.d";

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

function extractYoutubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s?#]+)/,
    /(?:youtu\.be\/)([^&\s?#/]+)/,
    /(?:youtube\.com\/shorts\/)([^&\s?#/]+)/,
    /(?:youtube\.com\/embed\/)([^&\s?#/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url; // fallback
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  useEffect(() => {
    if (!video) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  if (!video) return null;

  const effectiveYoutubeId = extractYoutubeId(
    video.youtubeUrl || video.youtubeId,
  );
  const embedSrc = `https://www.youtube-nocookie.com/embed/${effectiveYoutubeId}?autoplay=1&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <dialog
      open
      className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent w-full h-full max-w-none max-h-none m-0 border-none p-0"
      aria-label={video.title}
    >
      {/* Backdrop */}
      <div
        role="presentation"
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full mx-4 sm:mx-8"
        style={{
          animation: "fade-in 0.3s ease both",
          maxWidth: "min(90vw, 900px)",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-11 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full glass"
          aria-label="Close video"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video container — responsive 16:9 */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
          <div style={{ paddingBottom: "56.25%" }} className="relative">
            <iframe
              src={embedSrc}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 px-1">
          <h2 className="font-display font-bold text-base sm:text-xl text-foreground">
            {video.title}
          </h2>
          {video.description && (
            <p className="mt-1 text-muted-foreground text-sm">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
