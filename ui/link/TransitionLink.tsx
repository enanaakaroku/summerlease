"use client";

import Link from "next/link";
import { usePageTransition } from "../PageTransitionProvider";

type TransitionLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function TransitionLink({
  href,
  children,
  className = "",
}: TransitionLinkProps) {
  const { startTransition, isTransitioning } = usePageTransition();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0 ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    event.preventDefault();

    if (isTransitioning) return;

    startTransition(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
