"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScrambleTextProps = {
  text: string;
  className?: string;

  /**
   * 每个字符扰动多少次
   */
  scrambleCount?: number;

  /**
   * 每一帧间隔，越小越快
   */
  interval?: number;

  /**
   * 每个字符之间的启动延迟
   */
  stagger?: number;
};

const ENGLISH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";

const COMMON_CHINESE_CHARS =
  "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞";

function getRandomItem(source: string) {
  return source[Math.floor(Math.random() * source.length)];
}

function isEnglishChar(char: string) {
  return /^[A-Za-z]$/.test(char);
}

function isNumberChar(char: string) {
  return /^[0-9]$/.test(char);
}

function isChineseChar(char: string) {
  return /^[\u4e00-\u9fff]$/.test(char);
}

function getRandomSameTypeChar(char: string) {
  if (isEnglishChar(char)) {
    const source =
      char === char.toUpperCase()
        ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        : "abcdefghijklmnopqrstuvwxyz";

    return getRandomItem(source);
  }

  if (isNumberChar(char)) {
    return getRandomItem(NUMBER_CHARS);
  }

  if (isChineseChar(char)) {
    return getRandomItem(COMMON_CHINESE_CHARS);
  }

  return char;
}

export default function ScrambleText({
  text,
  className = "",
  scrambleCount = 8,
  interval = 32,
  stagger = 24,
}: ScrambleTextProps) {
  const chars = useMemo(() => Array.from(text), [text]);

  const [displayChars, setDisplayChars] = useState(chars);

  const timersRef = useRef<number[]>([]);
  const isAnimatingRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    timersRef.current = [];
  };

  useEffect(() => {
    setDisplayChars(chars);

    return () => {
      clearTimers();
    };
  }, [chars]);

  const startScramble = () => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    clearTimers();

    chars.forEach((originalChar, index) => {
      const totalSteps = scrambleCount + index;
      const startDelay = index * stagger;

      for (let step = 0; step <= totalSteps; step++) {
        const timer = window.setTimeout(
          () => {
            setDisplayChars((prev) => {
              const next = [...prev];

              const shouldRestore = step === totalSteps;

              next[index] = shouldRestore
                ? originalChar
                : getRandomSameTypeChar(originalChar);

              return next;
            });

            const isLastChar = index === chars.length - 1;
            const isLastStep = step === totalSteps;

            if (isLastChar && isLastStep) {
              isAnimatingRef.current = false;
            }
          },
          startDelay + step * interval,
        );

        timersRef.current.push(timer);
      }
    });
  };

  return (
    <span
      className={`inline-block cursor-pointer whitespace-pre ${className}`}
      onMouseEnter={startScramble}
    >
      {displayChars.map((char, index) => (
        <span key={`${char}-${index}`} className="inline-block">
          {char}
        </span>
      ))}
    </span>
  );
}
