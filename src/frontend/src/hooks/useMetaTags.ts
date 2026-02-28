import { useEffect } from "react";

interface MetaTagsOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

export function useMetaTags(options: MetaTagsOptions) {
  useEffect(() => {
    const {
      title = "VR1627 | Video Editor",
      description = "Professional video editing portfolio by VR1627. Cinematic edits, short-form content, and client work.",
      ogTitle = title,
      ogDescription = description,
      ogImage,
      ogType = "website",
      twitterCard = ogImage ? "summary_large_image" : "summary",
    } = options;

    // Set document title
    document.title = title;

    // Helper to set/create meta tag
    function setMeta(name: string, content: string, property = false) {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    setMeta("description", description);
    setMeta("og:title", ogTitle, true);
    setMeta("og:description", ogDescription, true);
    setMeta("og:type", ogType, true);
    setMeta("twitter:card", twitterCard);
    setMeta("twitter:title", ogTitle);
    setMeta("twitter:description", ogDescription);

    if (ogImage) {
      const absoluteImage = ogImage.startsWith("http")
        ? ogImage
        : `${window.location.origin}${ogImage}`;
      setMeta("og:image", absoluteImage, true);
      setMeta("twitter:image", absoluteImage);
    }
  }, [options]);
}
