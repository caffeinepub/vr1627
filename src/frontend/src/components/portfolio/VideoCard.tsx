import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Category, Video } from "../../backend.d";

const CATEGORY_LABELS: Record<Category, string> = {
  categoryShorts: "Shorts",
  categoryLongVideos: "Long Videos",
  categoryClientWork: "Client Work",
};

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

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  delay?: number;
}

export default function VideoCard({
  video,
  onClick,
  delay = 0,
}: VideoCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const effectiveYoutubeId = extractYoutubeId(
    video.youtubeUrl || video.youtubeId,
  );

  const previewSrc = `https://www.youtube-nocookie.com/embed/${effectiveYoutubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${effectiveYoutubeId}&rel=0&modestbranding=1&playsinline=1&enablejsapi=0`;

  // Play when in viewport, stop when scrolled away
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={cardRef}
      type="button"
      className="reveal video-card group cursor-pointer text-left w-full"
      style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
      onClick={() => onClick(video)}
      aria-label={`Play: ${video.title}`}
    >
      {/* Thumbnail / Autoplay preview */}
      <div
        className="relative overflow-hidden rounded-2xl bg-muted mb-3"
        style={{ paddingBottom: "56.25%", height: 0 }}
      >
        {isVisible ? (
          /* Autoplay muted preview — always on once in viewport */
          <iframe
            src={previewSrc}
            title={`Preview: ${video.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 w-full h-full pointer-events-none"
            tabIndex={-1}
          />
        ) : (
          /* Placeholder while not yet visible */
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted animate-pulse">
            <Play className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Click-to-open overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full glass flex items-center justify-center glow-blue scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge
            className="text-xs font-mono-custom glass border-white/10 text-foreground"
            variant="outline"
          >
            {CATEGORY_LABELS[video.category]}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="font-display font-bold text-sm md:text-base text-foreground truncate group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </button>
  );
}
