"use client";

import HoverBlurCard from "@/ui/card/HoverBlurCard";
import {
  HoverTargetingReticleCard,
  HoverTargetingReticleCardItem,
} from "@/ui/card/HoverTargetingReticleCard";
import HoverTiltCard from "@/ui/card/HoverTiltCard";
import TransitionLink from "@/ui/link/TransitionLink";
import { range } from "lodash-es";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import HoverDotLineCard from "@/ui/card/HoverDotLineCard";
import MosaicRevealCard from "@/ui/card/MosaicRevealCard";
import HoverTiltShiftCard from "@/ui/card/HoverTiltShiftCard";
import HoverTiltShiftGlitchCard from "@/ui/card/HoverTiltShiftGlitchCard";

const IMAGE_LIST = range(1, 10).map((n) => ({
  src: `/pic/bg${n}.png`,
  herf: `/picture/${n}`,
}));

export default function LinkImageScene() {
  const [activeImage, setActiveImage] = useState({
    src: `/pic/bg1.png`,
    herf: `/picture/1`,
  });
  const handleTargetingReticleChange = (img: typeof activeImage | null) => {
    if (img) {
      setActiveImage(img);
    }
  };

  return (
    <main className="flex flex-1 w-full max-w-3xl flex-wrap bg-white dark:bg-black sm:items-start">
      <TransitionLink href={activeImage.herf} className=" w-1/2">
        <MosaicRevealCard rows={10} cols={10} triggerKey={activeImage.src}>
          <HoverDotLineCard className="relative overflow-hidden aspect-square">
            <Image
              src={activeImage.src}
              alt="t1.webp"
              loading="eager"
              fill
              style={{ objectFit: "cover", objectPosition: "top" }}
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </HoverDotLineCard>
        </MosaicRevealCard>
      </TransitionLink>
      <TransitionLink href={activeImage.herf} className="group w-1/2">
        <HoverTiltShiftGlitchCard className="aspect-square">
          <Image
            src={activeImage.src}
            fill
            style={{ objectFit: "cover", objectPosition: "top" }}
            sizes="(max-width: 768px) 100vw, 300px"
            alt="t1.webp"
            loading="eager"
          />
        </HoverTiltShiftGlitchCard>
      </TransitionLink>
      <Link href={activeImage.herf} className="group w-1/2">
        <HoverTiltCard className="aspect-square">
          <Image
            src={activeImage.src}
            fill
            style={{ objectFit: "cover", objectPosition: "top" }}
            sizes="(max-width: 768px) 100vw, 300px"
            alt="t1.webp"
            loading="eager"
          />
        </HoverTiltCard>
      </Link>
      <div className="w-1/2">
        <HoverTargetingReticleCard
          className="grid grid-cols-3 grid-rows-3 gap-4 group"
          onActiveValueChange={handleTargetingReticleChange}
        >
          {IMAGE_LIST.map((img, index) => (
            <HoverTargetingReticleCardItem key={index} activeValue={img}>
              <TransitionLink
                href={`/picture/${index + 1}`}
                className="group-hover:cursor-[url('/crosshair.svg')_10_10,crosshair]"
              >
                <Image
                  className="w-full aspect-square object-cover"
                  width={552}
                  height={828}
                  src={img.src}
                  alt={`bg${index}`}
                ></Image>
              </TransitionLink>
            </HoverTargetingReticleCardItem>
          ))}
        </HoverTargetingReticleCard>
      </div>
    </main>
  );
}
