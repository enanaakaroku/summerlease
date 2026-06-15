"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

import PortfolioNav from "./PortfolioNav";
import PortfolioImageLink from "./PortfolioImageLink";
import ScrollMoveText from "@/ui/text/ScrollMoveText";
import ScrollHighlightText from "@/ui/text/ScrollHighlightText";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

export default function PortfolioScene() {
  const brandSectionRef = useRef<HTMLElement | null>(null);
  const brandTextRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const highlightSectionRef = useRef<HTMLDivElement | null>(null);
  const crossButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const section = brandSectionRef.current;
    const brandText = brandTextRef.current;

    if (!section || !brandText) return;

    const tween = gsap.fromTo(
      brandText,
      {
        xPercent: -100,
        x: 0,
      },
      {
        xPercent: 0,
        x: window.innerWidth / 2 + 300,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    const brandSection = brandSectionRef.current;
    const highlightSection = highlightSectionRef.current;

    if (!main || !brandSection || !highlightSection) return;

    const originalColor = "#2b292c";
    const darkColor = "#0a0a0a";

    const toDarkTween = gsap.to(main, {
      backgroundColor: darkColor,
      ease: "none",
      scrollTrigger: {
        trigger: brandSection,
        start: "top bottom",
        end: "top center",
        scrub: true,
      },
    });

    // const toOriginalTween = gsap.to(main, {
    //   backgroundColor: originalColor,
    //   ease: "none",
    //   scrollTrigger: {
    //     trigger: highlightSection,
    //     start: "top top",
    //     end: "top top",
    //     scrub: true,
    //   },
    // });

    return () => {
      toDarkTween.scrollTrigger?.kill();
      toDarkTween.kill();

      //   toOriginalTween.scrollTrigger?.kill();
      //   toOriginalTween.kill();
    };
  }, []);

  useEffect(() => {
    const crossButton = crossButtonRef.current;
    const main = mainRef.current;

    if (!crossButton || !main) return;

    const tween = gsap.to(crossButton, {
      rotate: -360,
      ease: "none",
      scrollTrigger: {
        trigger: main,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const handleBackToTop = () => {
    gsap.to(window, {
      duration: 0.9,
      ease: "power3.inOut",
      scrollTo: {
        y: 0,
        offsetY: 0,
      },
    });
  };

  return (
    <main
      ref={mainRef}
      className="bg-summer-gray relative min-h-screen text-white"
    >
      <nav className="bg-summer-white fixed bottom-6 left-1/2 z-9999 flex h-16.5 w-fit -translate-x-1/2 items-center rounded-l-4xl rounded-r-xl">
        <PortfolioNav
          crossRef={crossButtonRef}
          onCrossClick={handleBackToTop}
        ></PortfolioNav>
      </nav>
      <div className="absolute top-0 left-0 h-20 w-screen bg-[#ff4343]/19" />
      <div className="fixed top-0 left-0 h-screen w-60 bg-[#ff4343]/19" />

      <section className="relative flow-root h-screen">
        <div className="bg-summer-white absolute top-0 left-0 z-0 h-full w-30" />

        <h1 className="font-avone absolute top-56 left-40 text-[128px] leading-[0.8]">
          SUMMERLEASE
        </h1>
      </section>

      <section ref={brandSectionRef} className="relative overflow-hidden">
        <div className="bg-summer-white absolute top-0 left-0 h-[74vh] w-30" />

        <div className="ml-30 flex gap-6">
          <PortfolioImageLink
            href="/"
            src="/pic/bg1.png"
            title="口口口口口口"
          ></PortfolioImageLink>
          <PortfolioImageLink
            href="/"
            src="/pic/bg1.png"
            title="口口口口口口"
          ></PortfolioImageLink>
          <PortfolioImageLink
            href="/"
            src="/pic/bg1.png"
            title="口口口口口口"
          ></PortfolioImageLink>
        </div>

        <div
          ref={brandTextRef}
          className="font-avone w-fit -translate-x-full text-[240px] whitespace-nowrap"
        >
          Brand,Model,Strorytelling
        </div>
      </section>
      <div ref={highlightSectionRef}>
        <ScrollHighlightText
          className="h-screen text-[48px]"
          paragraphClassName="mx-auto w-4/5"
          texts={[
            "归档记录的是我日常游玩过程中的一些片段、体验与思考。相比单纯展示通关进度，我更希望把它当作一个持续更新的游戏观察笔记：包括某款游戏带来的情绪体验、关卡与系统设计上的亮点、视觉与交互细节，以及那些在游玩过程中让我停下来思考的瞬间。",
            "这些记录不一定完整，也不追求专业评测式的结论。它们更像是我作为玩家与设计学习者之间的双重视角：一方面记录自己真实的游玩感受，另一方面也尝试从机制、叙事、节奏、界面与美术表现中提炼值得参考的设计经验。",
          ]}
        />
      </div>
      <section>
        <div className="mx-auto grid w-400 grid-cols-[320px_1280px] grid-rows-[80px_320px_400px]">
          <div className="border-summer-white col-start-1 row-start-1 ring">
            Game Experience
          </div>

          <div className="relative col-start-1 row-start-2 aspect-square w-80">
            <Image
              src="/pic/bg1.png"
              alt=""
              fill
              className="object-cover"
            ></Image>
            <div className="absolute top-0 right-full flex h-full w-26.25 items-end">
              <div className="bg-summer-white h-1/2 flex-1 rounded-tl-full rounded-tr-lg"></div>
              <div className="bg-summer-white h-full flex-1"></div>
            </div>
          </div>
          <div className="border-summer-white col-start-2 row-span-2 row-start-2 h-full border">
            <ul>
              <li>
                <img src="/icons/external.svg" alt="" />
                占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.
              </li>
              <li>
                <img src="/icons/external.svg" alt="" />
                占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.
              </li>
              <li>
                <img src="/icons/external.svg" alt="" />
                占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.
              </li>
              <li>
                <img src="/icons/external.svg" alt="" />
                占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.
              </li>
              <li>
                <img src="/icons/external.svg" alt="" />
                占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.
              </li>
              <li>
                <img src="/icons/external.svg" alt="" />
                占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.
              </li>
              <li>
                <img src="/icons/external.svg" alt="" />
                占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.占位符.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
