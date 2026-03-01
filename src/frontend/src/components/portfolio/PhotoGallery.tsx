import { Image, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "../../backend.d";
import { useGetPhotoCategories, useGetPhotos } from "../../hooks/useQueries";
import { ExternalBlob } from "../../utils/ExternalBlob";

function PhotoLightbox({
  photo,
  url,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo | null;
  url: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    if (!photo) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [photo, onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-transparent w-full h-full max-w-none max-h-none m-0 border-none"
      aria-label={photo.title}
    >
      <div
        role="presentation"
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div
        className="relative z-10 max-w-4xl w-full"
        style={{ animation: "fade-in 0.3s ease both" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full glass"
          aria-label="Close photo"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="rounded-2xl overflow-hidden bg-zinc-800">
          <img
            src={url}
            alt={photo.title}
            className="w-full max-h-[80vh] object-contain"
          />
        </div>
        {photo.title && (
          <p className="text-center text-muted-foreground text-sm mt-3">
            {photo.title}
          </p>
        )}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2 glass rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 glass rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** A card that shows one photo from a group, cycling through on hover */
function GroupedPhotoItem({
  group,
  onClickPhoto,
  delay,
}: {
  group: Photo[];
  onClickPhoto: (photo: Photo) => void;
  delay: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhoto = group[activeIndex];
  const url = ExternalBlob.fromURL(currentPhoto.blobId).getDirectURL();

  // When activeIndex changes (hover cycle), reset image state for new photo
  const prevIndexRef = useRef(activeIndex);
  useEffect(() => {
    if (prevIndexRef.current !== activeIndex) {
      setImageState("loading");
      prevIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

  const startCycle = () => {
    if (group.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % group.length);
    }, 1200);
  };

  const stopCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveIndex(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const isMultiple = group.length > 1;

  return (
    <div
      className="reveal flex flex-col"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Image container */}
      <button
        type="button"
        className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square w-full text-left"
        style={{ background: "oklch(0.18 0 0)" }}
        onClick={() => onClickPhoto(currentPhoto)}
        onMouseEnter={startCycle}
        onMouseLeave={stopCycle}
        aria-label={`View photo: ${currentPhoto.title}${isMultiple ? ` (${group.length} images)` : ""}`}
      >
        {/* Loading skeleton */}
        {imageState === "loading" && (
          <div
            className="absolute inset-0 animate-pulse rounded-2xl"
            style={{ background: "oklch(0.22 0 0)" }}
          />
        )}

        {/* Error placeholder */}
        {imageState === "error" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl"
            style={{ background: "oklch(0.20 0 0)" }}
          >
            <Image className="w-8 h-8" style={{ color: "oklch(0.45 0 0)" }} />
          </div>
        )}

        {/* Image */}
        <img
          key={url}
          src={url}
          alt={currentPhoto.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageState === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setImageState("loaded")}
          onError={() => setImageState("error")}
        />

        {/* Zoom overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white" />
        </div>

        {/* Multi-image badge */}
        {isMultiple && (
          <div className="absolute top-2 right-2 z-10">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold glass border border-white/20 text-white/90 select-none">
              {group.length} images
            </span>
          </div>
        )}

        {/* Dot indicators for multiple images */}
        {isMultiple && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {group.map((_, idx) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: dot indicators
                key={idx}
                className={`block rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-3 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </button>

      {/* Title below image */}
      {currentPhoto.title && (
        <p className="text-sm font-medium text-foreground mt-2 truncate px-1">
          {currentPhoto.title}
        </p>
      )}
    </div>
  );
}

export default function PhotoGallery() {
  const { data: photos = [], isLoading } = useGetPhotos();
  const { data: categories = [] } = useGetPhotoCategories();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [lightboxGroup, setLightboxGroup] = useState<Photo[]>([]);
  const [lightboxGroupIndex, setLightboxGroupIndex] = useState(0);

  // Filter photos by category
  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  // Group photos by exact title
  const groupMap = filteredPhotos.reduce(
    (acc, photo) => {
      const key = photo.title?.trim() ?? "";
      if (!acc[key]) acc[key] = [];
      acc[key].push(photo);
      return acc;
    },
    {} as Record<string, Photo[]>,
  );
  const photoGroups = Object.values(groupMap);

  // Open lightbox for a specific photo within its title group
  const openLightbox = (photo: Photo) => {
    const key = photo.title?.trim() ?? "";
    const group = groupMap[key] ?? [photo];
    const idxInGroup = group.findIndex((p) => p.id === photo.id);
    setLightboxGroup(group);
    setLightboxGroupIndex(idxInGroup >= 0 ? idxInGroup : 0);
    setLightboxPhoto(photo);
  };

  const currentLightboxUrl = lightboxGroup[lightboxGroupIndex]
    ? ExternalBlob.fromURL(
        lightboxGroup[lightboxGroupIndex].blobId ?? "",
      ).getDirectURL()
    : "";

  const handleLightboxPrev = () => {
    setLightboxGroupIndex((prev) => {
      const next = (prev - 1 + lightboxGroup.length) % lightboxGroup.length;
      setLightboxPhoto(lightboxGroup[next]);
      return next;
    });
  };

  const handleLightboxNext = () => {
    setLightboxGroupIndex((prev) => {
      const next = (prev + 1) % lightboxGroup.length;
      setLightboxPhoto(lightboxGroup[next]);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={i}
            className="aspect-square rounded-2xl animate-pulse"
            style={{ background: "oklch(0.22 0 0)" }}
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-3xl">
        <div
          className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center"
          style={{ background: "oklch(0.22 0 0)" }}
        >
          <Image className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground">No photos yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Category filter buttons */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setLightboxPhoto(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-blue-glow"
                  : "glass text-muted-foreground hover:text-foreground hover:bg-white/8"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photoGroups.map((group, i) => (
          <GroupedPhotoItem
            key={`${group[0].title?.trim() ?? ""}-${group[0].id}`}
            group={group}
            onClickPhoto={openLightbox}
            delay={i * 40}
          />
        ))}
      </div>

      <PhotoLightbox
        photo={lightboxPhoto}
        url={currentLightboxUrl}
        onClose={() => {
          setLightboxPhoto(null);
          setLightboxGroup([]);
          setLightboxGroupIndex(0);
        }}
        onPrev={handleLightboxPrev}
        onNext={handleLightboxNext}
      />
    </>
  );
}
