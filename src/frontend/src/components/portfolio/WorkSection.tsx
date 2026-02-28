import { Film, Image, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Category, type Video } from "../../backend.d";
import PhotoGallery from "./PhotoGallery";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";

const CATEGORIES: Array<{ id: "all" | Category; label: string }> = [
  { id: "all", label: "All" },
  { id: Category.categoryShorts, label: "Shorts" },
  { id: Category.categoryLongVideos, label: "Long Videos" },
  { id: Category.categoryClientWork, label: "Client Work" },
];

interface WorkSectionProps {
  videos: Video[];
  isLoading: boolean;
}

export default function WorkSection({ videos, isLoading }: WorkSectionProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | Category>("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    for (const item of Array.from(section.querySelectorAll(".reveal"))) {
      observer.observe(item);
    }

    const mutationObserver = new MutationObserver(() => {
      for (const item of Array.from(
        section.querySelectorAll(".reveal:not(.visible)"),
      )) {
        observer.observe(item);
      }
    });
    mutationObserver.observe(section, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const filteredVideos =
    activeCategory === "all"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  const sortedVideos = [...filteredVideos].sort(
    (a, b) => Number(a.sortOrder) - Number(b.sortOrder),
  );

  return (
    <section id="work" ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="reveal flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Film className="w-4 h-4" />
              <span className="font-mono-custom text-xs uppercase tracking-widest">
                Portfolio
              </span>
            </div>
            <div className="h-px flex-1 bg-border max-w-24" />
          </div>

          <h2 className="reveal font-display font-black text-[clamp(2.5rem,6vw,4rem)] leading-tight gradient-text mb-4">
            Selected Work
          </h2>
          <p className="reveal text-muted-foreground text-lg max-w-md">
            A curated collection of video edits spanning cinematic, commercial,
            and short-form content.
          </p>
        </div>

        {/* Category filters */}
        <div className="reveal flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-blue-glow"
                  : "glass text-muted-foreground hover:text-foreground hover:bg-white/8"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Videos grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <div key={i} className="space-y-3">
                <div className="aspect-video rounded-2xl bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : sortedVideos.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Play className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium">No videos yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Check back soon for new work
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos.map((video, i) => (
              <VideoCard
                key={String(video.id)}
                video={video}
                onClick={setSelectedVideo}
                delay={i * 60}
              />
            ))}
          </div>
        )}

        {/* Photo Gallery subsection */}
        <div className="mt-24">
          <div className="reveal flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Image className="w-4 h-4" />
              <span className="font-mono-custom text-xs uppercase tracking-widest">
                Gallery
              </span>
            </div>
            <div className="h-px flex-1 bg-border max-w-24" />
          </div>

          <h3 className="reveal font-display font-black text-[clamp(2rem,5vw,3rem)] gradient-text mb-4">
            Photography
          </h3>
          <p className="reveal text-muted-foreground mb-10">
            Behind the scenes and visual inspiration.
          </p>

          <PhotoGallery />
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
}
