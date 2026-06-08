"use client";

import { useEffect, useState } from "react";
import { useMotionValue } from "motion/react";

type MouseMotionOptions = {
  targetRef?: React.RefObject<HTMLElement | null> | null;
};

type TargetRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export default function useMouseMotionValue({
  targetRef,
}: MouseMotionOptions = {}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const entered = useMotionValue(0);
  const [isEntered, setIsEntered] = useState(false);

  const [rect, setRect] = useState<TargetRect>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const targetElement = targetRef?.current;
    const updateRect = () => {
      if (targetElement) {
        const nextRect = targetElement.getBoundingClientRect();

        setRect({
          left: nextRect.left,
          top: nextRect.top,
          width: nextRect.width,
          height: nextRect.height,
        });
      } else {
        setRect({
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateRect();

    const handleMouseMove = (event: MouseEvent) => {
      if (targetElement) {
        const nextRect = targetElement.getBoundingClientRect();

        x.set(event.clientX - nextRect.left);
        y.set(event.clientY - nextRect.top);
      } else {
        x.set(event.clientX);
        y.set(event.clientY);
      }
    };

    const handleMouseEnter = () => {
      setIsEntered(true);
      entered.set(1);
    };

    const handleMouseLeave = () => {
      setIsEntered(false);
      entered.set(0);
    };

    if (targetElement) {
      targetElement.addEventListener("mousemove", handleMouseMove);
      targetElement.addEventListener("mouseenter", handleMouseEnter);
      targetElement.addEventListener("mouseleave", handleMouseLeave);

      const resizeObserver = new ResizeObserver(updateRect);
      resizeObserver.observe(targetElement);

      window.addEventListener("scroll", updateRect, true);
      window.addEventListener("resize", updateRect);

      return () => {
        targetElement.removeEventListener("mousemove", handleMouseMove);
        targetElement.removeEventListener("mouseenter", handleMouseEnter);
        targetElement.removeEventListener("mouseleave", handleMouseLeave);

        resizeObserver.disconnect();

        window.removeEventListener("scroll", updateRect, true);
        window.removeEventListener("resize", updateRect);
      };
    }

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", updateRect);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", updateRect);
    };
  }, [targetRef, x, y, entered]);

  return {
    x,
    y,
    entered,
    rect,
    isEntered,
  };
}
