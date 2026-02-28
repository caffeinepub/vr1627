import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { useState } from "react";
import type { Category, Video } from "../../backend.d";

const CATEGORY_LABELS: Record<Category, string> = {
  categoryShorts: "Shorts",
  categoryLongVideos: "Long Videos",
  categoryClientWork: "Client Work",
};

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
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const thumbnailUrl = imgError
    ? null
    : `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  const fallbackUrl = imgError
    ? null
    : `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <button
      type="button"
      className="reveal video-card group cursor-pointer text-left w-full"
      style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
      onClick={() => onClick(video)}
      aria-label={`Play: ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-2xl bg-muted aspect-video mb-3">
        {/* Skeleton */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {thumbnailUrl && !imgError ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (thumbnailUrl.includes("maxresdefault")) {
                setImgLoaded(false);
              } else {
                setImgError(true);
              }
            }}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0 0) 0%, oklch(0.18 0.04 250) 100%)",
            }}
          >
            <Play className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Fallback for maxresdefault failures */}
        {thumbnailUrl?.includes("maxresdefault") &&
          imgLoaded === false &&
          !imgError && (
            <img
              src={fallbackUrl ?? ""}
              alt={video.title}
              className="w-full h-full object-cover absolute inset-0"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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
