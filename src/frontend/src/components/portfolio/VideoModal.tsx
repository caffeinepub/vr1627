import { X } from "lucide-react";
import { useEffect } from "react";
import type { Video } from "../../backend.d";

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
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

  return (
    <dialog
      open
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-transparent w-full h-full max-w-none max-h-none m-0 border-none"
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
        className="relative z-10 w-full max-w-4xl"
        style={{ animation: "fade-in 0.3s ease both" }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full glass"
          aria-label="Close video"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video container */}
        <div
          className="relative rounded-2xl overflow-hidden bg-black shadow-2xl"
          style={{ aspectRatio: "16/9" }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="mt-4 px-1">
          <h2 className="font-display font-bold text-xl text-foreground">
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
