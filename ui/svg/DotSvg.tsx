export default function DotSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 327 327"
      className="absolute inset-0 h-full w-full pointer-events-none animate-[blog-dots-out_250ms_ease_forwards] group-hover:animate-[blog-dots-in_250ms_ease_forwards]"
      preserveAspectRatio="none"
      aria-hidden="true"
      fill="none"
    >
      <rect
        width="100%"
        height="100%"
        fill="url(#blogPatternDots)"
        fillOpacity={0.3}
      ></rect>
      <defs>
        <pattern
          id="blogPatternDots"
          patternUnits="userSpaceOnUse"
          width={21.75}
          height={21.75}
        >
          <circle cx={10.875} cy={10.875} r={1.5} fill="white"></circle>
        </pattern>
      </defs>
    </svg>
  );
}
