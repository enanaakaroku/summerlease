"use client";

import styles from "./CRTDisplayEffect.module.scss";

type CRTDisplayEffectProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
};

export default function CRTDisplayEffect({
  children,
  className = "",
  intensity = "medium",
}: CRTDisplayEffectProps) {
  return (
    <div className={`${styles.crt} ${styles[intensity]} ${className}`}>
      <div className={styles.content}>{children}</div>

      {/* 扫描线动画 */}
      <div className={styles.scanlines} />

      {/* RGB 子像素纹理 */}
      <div className={styles.phosphor} />

      {/* 横向抖动撕裂层 */}
      <div className={`${styles.tear} ${styles.tearOne}`} />
      <div className={`${styles.tear} ${styles.tearTwo}`} />
      <div className={`${styles.tear} ${styles.tearThree}`} />

      {/* 色差闪烁 */}
      <div className={`${styles.rgbShift} ${styles.rgbRed}`} />
      <div className={`${styles.rgbShift} ${styles.rgbBlue}`} />

      {/* 暗角 */}
      <div className={styles.vignette} />

      {/* 玻璃高光 */}
      <div className={styles.glass} />

      {/* 轻微闪烁 */}
      <div className={styles.flicker} />
    </div>
  );
}
