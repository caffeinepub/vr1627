import { Image, X, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";
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
        <div className="rounded-2xl overflow-hidden">
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

function PhotoItem({
  photo,
  onClick,
  delay,
}: {
  photo: Photo;
  onClick: () => void;
  delay: number;
}) {
  const url = ExternalBlob.fromURL(photo.blobId).getDirectURL();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="reveal flex flex-col"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Image container */}
      <button
        type="button"
        className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square bg-muted w-full text-left"
        onClick={onClick}
        aria-label={`View photo: ${photo.title}`}
      >
        {!loaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
        <img
          src={url}
          alt={photo.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
        {/* Zoom overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white" />
        </div>
      </button>

      {/* Title below image */}
      {photo.title && (
        <p className="text-sm font-medium text-foreground mt-2 truncate px-1">
          {photo.title}
        </p>
      )}
    </div>
  );
}

export default function PhotoGallery() {
  const { data: photos = [], isLoading } = useGetPhotos();
  const { data: categories = [] } = useGetPhotoCategories();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter photos by category
  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const lightboxPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;
  const lightboxUrl =
    lightboxIndex !== null
      ? ExternalBlob.fromURL(
          filteredPhotos[lightboxIndex]?.blobId ?? "",
        ).getDirectURL()
      : "";

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={i}
            className="aspect-square rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 glass rounded-3xl">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
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
                setLightboxIndex(null);
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
        {filteredPhotos.map((photo, i) => (
          <PhotoItem
            key={String(photo.id)}
            photo={photo}
            onClick={() => setLightboxIndex(i)}
            delay={i * 40}
          />
        ))}
      </div>

      <PhotoLightbox
        photo={lightboxPhoto}
        url={lightboxUrl}
        onClose={() => setLightboxIndex(null)}
        onPrev={() =>
          setLightboxIndex((prev) =>
            prev !== null
              ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length
              : 0,
          )
        }
        onNext={() =>
          setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % filteredPhotos.length : 0,
          )
        }
      />
    </>
  );
}
