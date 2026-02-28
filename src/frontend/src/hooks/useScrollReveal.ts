import { useEffect, useRef } from "react";

export function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

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

    for (const item of Array.from(element.querySelectorAll(".reveal"))) {
      observer.observe(item);
    }

    if (element.classList.contains("reveal")) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.classList.add("reveal");

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

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
}
