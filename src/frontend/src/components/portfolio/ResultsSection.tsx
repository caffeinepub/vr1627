import { BarChart2, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ResultItem, SiteText } from "../../backend.d";
import { useActor } from "../../hooks/useActor";
import { useGetResults } from "../../hooks/useQueries";
import { DEFAULT_SITE_TEXT } from "../../lib/siteTextDefaults";

export const RESULT_CATEGORIES = [
  "All",
  "Client Feedback",
  "Result Screenshot",
  "YT Analytics",
];

interface ResultsSectionProps {
  siteText?: SiteText;
}

/* ─── Lightbox ──────────────────────────────────────────────────────────── */

function ResultLightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: ResultItem | null;
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
      {/* Backdrop */}
      <div
        role="presentation"
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-5xl"
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

        <div className="rounded-2xl overflow-hidden bg-zinc-900 max-h-[85vh] overflow-y-auto">
          <img
            src={item.blobId}
            alt={item.title}
            className="w-full h-auto block"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>

        {item.title && (
          <p className="text-center text-muted-foreground text-sm mt-3 px-2">
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

/* ─── Result Card ────────────────────────────────────────────────────────── */

function ResultCard({
  item,
  onClick,
  index,
}: {
  item: ResultItem;
  onClick: () => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Scroll-reveal via IntersectionObserver
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger by index
          const timer = setTimeout(() => setVisible(true), index * 80);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition:
          "opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Card wrapper — clickable */}
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full text-left rounded-2xl overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          background: "oklch(0.13 0 0)",
          border: "1px solid oklch(0.96 0 0 / 8%)",
          display: "block",
        }}
        aria-label={`View full size: ${item.title}`}
      >
        {/* Skeleton shown while loading */}
        {!imgLoaded && !imgError && (
          <div
            className="w-full animate-pulse"
            style={{
              background: "oklch(0.18 0 0)",
              aspectRatio: "16 / 7",
              minHeight: "160px",
            }}
          />
        )}

        {/* Error fallback */}
        {imgError && (
          <div
            className="w-full flex flex-col items-center justify-center gap-2 text-muted-foreground py-16"
            style={{ background: "oklch(0.15 0 0)" }}
          >
            <BarChart2 className="w-8 h-8 opacity-30" />
            <span className="text-xs opacity-50">Image unavailable</span>
          </div>
        )}

        {/* The actual image — always rendered so browser can load it */}
        <img
          src={item.blobId}
          alt={item.title}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          style={{
            display: imgLoaded && !imgError ? "block" : "none",
            width: "100%",
            height: "auto",
          }}
          loading="lazy"
          decoding="async"
        />

        {/* Hover overlay with zoom icon */}
        {imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Category badge — top left */}
        {item.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium glass border border-white/10 text-foreground/80"
              style={{ backdropFilter: "blur(8px)" }}
            >
              {item.category}
            </span>
          </div>
        )}
      </button>

      {/* Title below image */}
      {item.title && (
        <p className="text-sm font-semibold text-foreground mt-3 px-1 leading-snug">
          {item.title}
        </p>
      )}
    </div>
  );
}

/* ─── Skeleton placeholder ───────────────────────────────────────────────── */

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{
        background: "oklch(0.15 0 0)",
        border: "1px solid oklch(0.96 0 0 / 6%)",
        aspectRatio: "16 / 7",
        minHeight: "160px",
        animationDelay: `${index * 120}ms`,
      }}
    />
  );
}

/* ─── Main Section ───────────────────────────────────────────────────────── */

export default function ResultsSection({ siteText }: ResultsSectionProps) {
  const _text = siteText ?? DEFAULT_SITE_TEXT;
  const { isFetching: isActorFetching } = useActor();
  const { data: results = [], isLoading: isResultsLoading } = useGetResults();
  const isLoading = isActorFetching || isResultsLoading;

  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredResults =
    activeCategory === "All"
      ? results
      : results.filter((r) => r.category === activeCategory);

  const lightboxItem =
    lightboxIndex !== null ? (filteredResults[lightboxIndex] ?? null) : null;

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev - 1 + filteredResults.length) % filteredResults.length
        : 0,
    );
  }, [filteredResults.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filteredResults.length : 0,
    );
  }, [filteredResults.length]);

  const handleClose = useCallback(() => setLightboxIndex(null), []);

  return (
    <section id="results" className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        {/* ── Section header ── */}
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

        {/* ── Category filters ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {RESULT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setLightboxIndex(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_oklch(var(--blue-glow)/40%)]"
                  : "glass text-muted-foreground hover:text-foreground hover:bg-white/8"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          /* Loading skeletons */
          <div className="flex flex-col gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 glass rounded-3xl">
            <div
              className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.18 0 0)" }}
            >
              <BarChart2 className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium">Coming soon</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Results and feedback will appear here
            </p>
          </div>
        ) : (
          /* Single-column vertical stack — one screenshot per row */
          <div className="flex flex-col gap-8">
            {filteredResults.map((item, i) => (
              <ResultCard
                key={String(item.id)}
                item={item}
                onClick={() => setLightboxIndex(i)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      <ResultLightbox
        item={lightboxItem}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
}
