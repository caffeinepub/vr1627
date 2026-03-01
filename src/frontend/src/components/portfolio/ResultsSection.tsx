import { BarChart2, ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ResultItem, SiteText } from "../../backend.d";
import { useGetResults } from "../../hooks/useQueries";
import { DEFAULT_SITE_TEXT } from "../../lib/siteTextDefaults";
import { ExternalBlob } from "../../utils/ExternalBlob";

const RESULT_CATEGORIES = [
  "All",
  "Client Feedback",
  "Result Screenshot",
  "YT Analytics",
];

interface ResultsSectionProps {
  siteText?: SiteText;
}

function ResultLightbox({
  item,
  url,
  onClose,
  onPrev,
  onNext,
}: {
  item: ResultItem | null;
  url: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    if (!item) return;
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
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-transparent w-full h-full max-w-none max-h-none m-0 border-none"
      aria-label={item.title}
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
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="rounded-2xl overflow-hidden bg-zinc-800">
          <img
            src={url}
            alt={item.title}
            className="w-full max-h-[80vh] object-contain"
          />
        </div>
        {item.title && (
          <p className="text-center text-muted-foreground text-sm mt-3">
            {item.title}
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

function ResultCard({
  item,
  onClick,
  delay,
}: {
  item: ResultItem;
  onClick: () => void;
  delay: number;
}) {
  const url = ExternalBlob.fromURL(item.blobId).getDirectURL();
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle cached images: if img is already complete on mount, onLoad won't fire
  useEffect(() => {
    if (imgRef.current?.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setImageState("loaded");
      } else {
        setImageState("error");
      }
    }
  }, []);

  return (
    <div
      className="reveal flex flex-col"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        type="button"
        onClick={onClick}
        className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-video w-full text-left"
        style={{ background: "oklch(0.18 0 0)" }}
        aria-label={`View: ${item.title}`}
      >
        {/* Loading skeleton — visible gray, not black */}
        {imageState === "loading" && (
          <div
            className="absolute inset-0 animate-pulse rounded-2xl"
            style={{ background: "oklch(0.22 0 0)" }}
          />
        )}

        {/* Error / no-image placeholder */}
        {imageState === "error" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl"
            style={{ background: "oklch(0.20 0 0)" }}
          >
            <ImageIcon
              className="w-8 h-8"
              style={{ color: "oklch(0.45 0 0)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.45 0 0)" }}
            >
              Preview
            </span>
          </div>
        )}

        {/* Actual image — always rendered so onLoad/onError fire.
            ref + useEffect handles the cached-image case where onLoad never fires. */}
        {url && (
          <img
            ref={imgRef}
            src={url}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageState === "loaded" ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImageState("loaded")}
            onError={() => setImageState("error")}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center glass">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Category badge */}
        {item.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-full text-xs glass border border-white/10 text-foreground/80">
              {item.category}
            </span>
          </div>
        )}
      </button>

      {item.title && (
        <p className="text-sm font-medium text-foreground mt-2 truncate px-1">
          {item.title}
        </p>
      )}
    </div>
  );
}

export default function ResultsSection({ siteText }: ResultsSectionProps) {
  const _text = siteText ?? DEFAULT_SITE_TEXT;
  const { data: results = [], isLoading } = useGetResults();
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredResults =
    activeCategory === "All"
      ? results
      : results.filter((r) => r.category === activeCategory);

  const lightboxItem =
    lightboxIndex !== null ? filteredResults[lightboxIndex] : null;
  const lightboxUrl =
    lightboxIndex !== null
      ? ExternalBlob.fromURL(
          filteredResults[lightboxIndex]?.blobId ?? "",
        ).getDirectURL()
      : "";

  return (
    <section id="results" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-primary">
              <BarChart2 className="w-4 h-4" />
              <span className="font-mono-custom text-xs uppercase tracking-widest">
                Results & Feedback
              </span>
            </div>
            <div className="h-px flex-1 bg-border max-w-24" />
          </div>
          <h2 className="font-display font-black text-[clamp(2rem,5vw,3.5rem)] leading-tight gradient-text">
            Client Results
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Real results, real feedback. Proof of the work behind the edits.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {RESULT_CATEGORIES.map((cat) => (
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

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                key={i}
                className="aspect-video rounded-2xl animate-pulse"
                style={{ background: "oklch(0.22 0 0)" }}
              />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.22 0 0)" }}
            >
              <BarChart2 className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium">Coming soon</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Results and feedback will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((item, i) => (
              <ResultCard
                key={String(item.id)}
                item={item}
                onClick={() => setLightboxIndex(i)}
                delay={i * 50}
              />
            ))}
          </div>
        )}
      </div>

      <ResultLightbox
        item={lightboxItem}
        url={lightboxUrl}
        onClose={() => setLightboxIndex(null)}
        onPrev={() =>
          setLightboxIndex((prev) =>
            prev !== null
              ? (prev - 1 + filteredResults.length) % filteredResults.length
              : 0,
          )
        }
        onNext={() =>
          setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % filteredResults.length : 0,
          )
        }
      />
    </section>
  );
}
