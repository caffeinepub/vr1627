export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/30 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/vr1627-logo-transparent.dim_200x200.png"
            alt="VR1627"
            className="w-6 h-6 object-contain opacity-60"
          />
          <span className="text-muted-foreground text-sm font-mono-custom">
            © {year} VR1627
          </span>
        </div>

        <p className="text-muted-foreground/50 text-xs">
          Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
