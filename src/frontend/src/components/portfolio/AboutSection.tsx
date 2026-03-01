import { User } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SiteText } from "../../backend.d";
import { useGetAboutMe } from "../../hooks/useQueries";
import { DEFAULT_SITE_TEXT } from "../../lib/siteTextDefaults";
import { ExternalBlob } from "../../utils/ExternalBlob";

interface AboutSectionProps {
  siteText?: SiteText;
}

export default function AboutSection({ siteText }: AboutSectionProps) {
  const text = siteText ?? DEFAULT_SITE_TEXT;
  const { data: about, isLoading, isError } = useGetAboutMe();
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
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    const items = section.querySelectorAll(".reveal");
    for (const item of Array.from(items)) {
      observer.observe(item);
    }
    return () => observer.disconnect();
  }, []);

  // Hide if not visible, errored, or loading with no data
  if (!isLoading && (!about || !about.isVisible || isError)) return null;

  if (isLoading) {
    return (
      <section id="about" className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-6 bg-muted rounded animate-pulse mb-4 w-24" />
          <div className="h-12 bg-muted rounded animate-pulse mb-8 w-64" />
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-48 h-48 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="space-y-3 flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const profileUrl = about?.profilePhotoBlobId
    ? ExternalBlob.fromURL(about.profilePhotoBlobId).getDirectURL()
    : null;

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="reveal flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-primary">
              <User className="w-4 h-4" />
              <span className="font-mono-custom text-xs uppercase tracking-widest">
                {text.aboutLabel}
              </span>
            </div>
            <div className="h-px flex-1 bg-border max-w-24" />
          </div>

          <h2 className="reveal font-display font-black text-[clamp(2.5rem,6vw,4rem)] leading-tight gradient-text">
            {text.aboutHeading}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Profile photo */}
          <div className="reveal shrink-0">
            {profileUrl ? (
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-primary/20 blur-xl" />
                <img
                  src={profileUrl}
                  alt="VR1627 profile"
                  className="relative w-48 h-48 rounded-full object-cover ring-2 ring-white/10"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-primary/10 blur-xl" />
                <div
                  className="relative w-48 h-48 rounded-full flex items-center justify-center ring-2 ring-white/10"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.14 0 0) 0%, oklch(0.18 0.04 250) 100%)",
                  }}
                >
                  <img
                    src="/assets/generated/vr1627-logo-transparent.dim_200x200.png"
                    alt="VR1627"
                    className="w-48 h-48 rounded-full object-contain p-4"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="reveal flex-1">
            <div className="prose prose-invert max-w-none">
              {about?.bio ? (
                <p className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap">
                  {about.bio}
                </p>
              ) : (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Passionate video editor crafting visual stories with precision
                  and creativity. Specializing in cinematic edits, short-form
                  content, and commercial productions.
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { label: text.stat1Label, value: text.stat1Value },
                { label: text.stat2Label, value: text.stat2Value },
                { label: text.stat3Label, value: text.stat3Value },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center glass rounded-2xl p-4"
                >
                  <p className="font-display font-black text-2xl gradient-text">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
