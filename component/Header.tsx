import TransitionLink from "@/ui/link/TransitionLink";
import WaveOrbitIcon from "@/ui/svg/WaveOrbitIcon";
import { Michroma } from "next/font/google";

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

      <TransitionLink href="/ship" className="ml-auto mr-4 underline">
        SATELLITE
      </TransitionLink>
    </div>
  );
}
