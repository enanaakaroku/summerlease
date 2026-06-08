"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { forwardRef, useRef } from "react";

type ParallaxImageCardProps = {
  src: string;
  alt?: string;
};

const ParallaxImageCard = forwardRef<HTMLDivElement, ParallaxImageCardProps>(
  function ParallaxImageCard({ src, alt = "" }, ref) {
    const cardRef = useRef<HTMLDivElement | null>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, {
      stiffness: 120,
      damping: 20,
      mass: 0.3,
    });

    const smoothY = useSpring(mouseY, {
      stiffness: 120,
      damping: 20,
      mass: 0.3,
    });

    const bgX = useTransform(smoothX, [-1, 1], [12, -12]);
    const bgY = useTransform(smoothY, [-1, 1], [12, -12]);

    const imageX = useTransform(smoothX, [-1, 1], [-8, 8]);
    const imageY = useTransform(smoothY, [-1, 1], [-8, 8]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      mouseX.set((x - centerX) / centerX);
      mouseY.set((y - centerY) / centerY);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
      <div
        ref={cardRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 模糊背景 */}
        <motion.div
          className="absolute inset-0 -z-1"
          style={{
            x: bgX,
            y: bgY,
            scale: 1.15,
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority
            className="object-cover blur-xl"
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/20 -z-1" />

        {/* 前景图片 */}
        <motion.div
          ref={ref}
          className="relative z-10"
          style={{
            x: imageX,
            y: imageY,
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={552}
            height={828}
            priority
            className="object-contain shadow-2xl"
          />
        </motion.div>
      </div>
    );
  },
);

export default ParallaxImageCard;
