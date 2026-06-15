import CrossPSvg from "@/ui/svg/CrossPSvg";
import LeftArrowSvg from "@/ui/svg/LeftArrowSvg";
import RightArrowSvg from "@/ui/svg/RightArrowSvg";
import Link from "next/link";

type PortfolioNavProps = {
  crossRef?: React.Ref<HTMLButtonElement>;
  onCrossClick?: () => void;
};

export default function PortfolioNav({
  crossRef,
  onCrossClick,
}: PortfolioNavProps) {
  return (
    <>
      <button
        ref={crossRef}
        type="button"
        onClick={onCrossClick}
        aria-label="Back to top"
        className="bg-summer-gray ml-0.75 flex h-15 w-15 items-center justify-center rounded-full"
      >
        <CrossPSvg />
      </button>

      <div className="ml-2">
        <LeftArrowSvg />
      </div>

      <ul className="text-summer-gray mx-2 flex gap-2.5">
        <li className="flex h-13 items-center justify-center rounded-xl px-2 text-[24px]">
          <Link href="/">占位</Link>
        </li>
        <li className="flex h-13 items-center justify-center rounded-xl px-2 text-[24px]">
          <Link href="/">占位占位</Link>
        </li>
        <li className="flex h-13 items-center justify-center rounded-xl px-2 text-[24px]">
          <Link href="/">占位IP占位</Link>
        </li>
      </ul>

      <div className="mr-2">
        <RightArrowSvg />
      </div>
    </>
  );
}
