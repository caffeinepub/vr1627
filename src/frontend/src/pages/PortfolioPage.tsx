import AboutSection from "../components/portfolio/AboutSection";
import ContactSection from "../components/portfolio/ContactSection";
import Footer from "../components/portfolio/Footer";
import HeroSection from "../components/portfolio/HeroSection";
import Navbar from "../components/portfolio/Navbar";
import WorkSection from "../components/portfolio/WorkSection";
import { useMetaTags } from "../hooks/useMetaTags";
import { useGetVideos } from "../hooks/useQueries";

export default function PortfolioPage() {
  const { data: videos = [], isLoading } = useGetVideos();

  useMetaTags({
    title: "VR1627 | Video Editor",
    description:
      "Professional video editing portfolio by VR1627. Cinematic edits, short-form content, and client work. Hire a professional video editor.",
    ogTitle: "VR1627 — Professional Video Editor",
    ogDescription:
      "Crafting cinematic stories through precise cuts, dynamic pacing, and visual storytelling. View my portfolio.",
    ogImage: "/assets/generated/vr1627-logo-transparent.dim_200x200.png",
    ogType: "website",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <HeroSection />
        <WorkSection videos={videos} isLoading={isLoading} />
        <AboutSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
