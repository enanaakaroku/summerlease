"use client";

import ParallaxImageCard from "@/ui/card/ParallaxImageCard";
import TypewriterCard from "@/ui/card/TypewriterCard";
import MouseFollowContainer from "@/ui/container/MouseFollowContainer";
import { useRef } from "react";

type ParallaxImageSceneProps = {
  src: string;
};

export default function ParallaxImageScene({ src }: ParallaxImageSceneProps) {
  const parallaxImageRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="h-screen flex justify-center items-center">
      <ParallaxImageCard src={src} ref={parallaxImageRef}></ParallaxImageCard>
      <MouseFollowContainer relativeTo={parallaxImageRef} mountAtEnter="once">
        <TypewriterCard text="滚滚长江东逝水😃️summerlease"></TypewriterCard>
      </MouseFollowContainer>
    </div>
  );
}
