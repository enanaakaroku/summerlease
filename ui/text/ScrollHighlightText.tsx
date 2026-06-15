"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollHighlightTextProps = {
  texts: string[];
  className?: string;
  paragraphClassName?: string;
  byChar?: boolean;

  /**
   * 高亮完成需要的滚动距离
   */
  scrollDistance?: number;
};

export default function ScrollHighlightText({
  texts,
  className = "",
  paragraphClassName = "",
  byChar = true,
  scrollDistance = 1400,
}: ScrollHighlightTextProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  const paragraphs = useMemo(() => {
    return texts.map((text) => {
      if (byChar) return Array.from(text);
      return text.split(/(\s+)/);
    });
  }, [texts, byChar]);

  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const chars = charsRef.current.filter(Boolean);

    if (!section || !wrapper || chars.length === 0) return;

    gsap.set(chars, {
      color: "#4d4d4d",
    });

    const tween = gsap.to(chars, {
      color: "#fcfaee",
      stagger: 0.04,
      ease: "none",
      scrollTrigger: {
        trigger: section,

        /**
         * 当 section 顶部到达视口顶部时开始 pin
         * 因为 wrapper 在 section 里是 h-screen + flex center，
         * 所以文字视觉上会处于屏幕垂直中心
         */
        start: "top top",

        /**
         * 继续滚动 scrollDistance 距离后完成高亮并解除 pin
         */
        end: `+=${scrollDistance}`,

        scrub: true,
        pin: true,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [paragraphs, scrollDistance]);

  let globalIndex = 0;

  return (
    <section ref={sectionRef} className="relative">
      <div
        ref={wrapperRef}
        className={`flex h-screen items-center ${className}`}
      >
        <div className="w-full">
          {paragraphs.map((parts, paragraphIndex) => (
            <p key={paragraphIndex} className={paragraphClassName}>
              {parts.map((char) => {
                const index = globalIndex;
                globalIndex += 1;

                return (
                  <span
                    key={index}
                    ref={(el) => {
                      if (el) charsRef.current[index] = el;
                    }}
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
