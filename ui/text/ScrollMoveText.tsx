"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollMoveTextProps = {
  text: string;
  className?: string;
};

export default function ScrollMoveText({
  text,
  className = "",
}: ScrollMoveTextProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const textElement = textRef.current;

    if (!section || !textElement) return;

    const tween = gsap.fromTo(
      textElement,
      {
        x: "-100vw",
      },
      {
        x: "100vw",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[200vh] overflow-hidden">
      <div
        ref={textRef}
        className={`sticky top-1/2 w-fit -translate-y-1/2 whitespace-nowrap ${className}`}
      >
        {text}
      </div>
    </section>
  );
}
