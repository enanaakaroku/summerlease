"use client";

import { animate, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type TypewriterCardProps = {
  text: string;
  duration?: number;
  delay?: number;
  className?: string;
};

export default function TypewriterCard({
  text,
  duration = 2,
  delay = 0,
  className = "",
}: TypewriterCardProps) {
  const chars = useMemo(() => Array.from(text), [text]);

  const count = useMotionValue(0);

  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    count.set(0);
    setDisplayText("");

    const controls = animate(count, chars.length, {
      duration,
      delay,
      ease: "linear",
      onUpdate: (latest) => {
        const currentLength = Math.round(latest);
        setDisplayText(chars.slice(0, currentLength).join(""));
      },
    });

    return () => controls.stop();
  }, [chars, chars.length, duration, delay, count]);

  return (
    <div className={`bg-black/40 p-6 ${className}`}>
      <motion.p className="whitespace-pre-wrap text-lg leading-relaxed text-white">
        {displayText}
        <motion.span
          animate={{ opacity: [0, 0, 1, 1, 1, 1, 0, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          |
        </motion.span>
      </motion.p>
    </div>
  );
}
