import DotSvg from "../svg/DotSvg";
import LineSvg from "../svg/LineSvg";

type HoverDotLineCardProps = {
  className?: string;
  children: React.ReactNode;
};

export default function HoverDotLineCard({
  className,
  children,
}: HoverDotLineCardProps) {
  return (
    <div className={`group ${className}`}>
      {children}
      <DotSvg></DotSvg>
      <LineSvg></LineSvg>
    </div>
  );
}
