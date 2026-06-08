"use client";

import { motion, useSpring, useTransform } from "motion/react";
import useMouseMotionValue from "@/hooks/useMouseMotionValue";
import { useEffect, useState } from "react";

type FollowContainerProps = {
  relativeTo?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  mountAtEnter?: "once" | "always" | "never";
};

export default function MouseFollowContainer({
  relativeTo,
  children,
  mountAtEnter = "never",
}: FollowContainerProps) {
  const { x, y, entered, rect, isEntered } = useMouseMotionValue({
    targetRef: relativeTo,
  });

  const [enteredOnce, setEnteredOnce] = useState(false);

  useEffect(() => {
    if (isEntered) {
      setEnteredOnce(true);
    }
  }, [isEntered]);

  const springX = useSpring(x, {
    stiffness: 120,
    damping: 22,
    mass: 0.4,
  });

  const springY = useSpring(y, {
    stiffness: 120,
    damping: 22,
    mass: 0.4,
  });

  const followX = useTransform(x, (latest) => {
    return rect.left + latest;
  });

  const followY = useTransform(y, (latest) => {
    return rect.top + latest;
  });

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{
        x: followX,
        y: followY,
        opacity: entered,
      }}
    >
      {mountAtEnter === "never" && children}
      {mountAtEnter === "once" && enteredOnce && children}
      {mountAtEnter === "always" && isEntered && children}
    </motion.div>
  );
}
