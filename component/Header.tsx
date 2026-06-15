import TransitionLink from "@/ui/link/TransitionLink";
import WaveOrbitIcon from "@/ui/svg/WaveOrbitIcon";
import { Michroma } from "next/font/google";
import ScrambleText from "@/ui/text/ScrambleText";

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
});

export default function Header() {
  return (
    <div
      className={`fixed w-full top-0 left-0 z-9999 flex items-center ${michroma.className}`}
    >
      <TransitionLink href="/">
        <WaveOrbitIcon></WaveOrbitIcon>
      </TransitionLink>

      <div className="ml-auto mr-4 flex gap-4">
        <TransitionLink href="/portfolio" className="underline">
          PORTFOLIO
        </TransitionLink>
        <TransitionLink href="/blog" className="underline">
          BLOG
        </TransitionLink>
        <TransitionLink href="/ship" className="underline">
          <ScrambleText text="SATELLITE"></ScrambleText>
        </TransitionLink>
      </div>
    </div>
  );
}
