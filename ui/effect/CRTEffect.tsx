"use client";

import styles from "./CRTEffect.module.scss";

type CRTEffectProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
};

export default function CRTEffect({
  children,
  className = "",
  intensity = "medium",
}: CRTEffectProps) {
  return (
    <div className={`${styles.crt} ${styles[intensity]} ${className}`}>
      <div className={styles.content}>{children}</div>

      <div className={styles.scanlines} />
      <div className={styles.phosphor} />
      <div className={styles.vignette} />
      <div className={styles.flicker} />
    </div>
  );
}
