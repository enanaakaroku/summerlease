export default function LineSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 327 327"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
      fill="none"
    >
      <line
        x1="20"
        y1="60"
        x2="38"
        y2="60"
        stroke="white"
        strokeWidth={1}
        className=" [stroke-dasharray:18] [stroke-dashoffset:18] transition-[stroke-dashoffset] duration-200 ease-linear group-hover:duration-300 group-hover:[stroke-dashoffset:0]"
      ></line>
      <line
        x1="60"
        y1="20"
        x2="60"
        y2="38"
        stroke="white"
        strokeWidth={1}
        className=" [stroke-dasharray:18] [stroke-dashoffset:18] transition-[stroke-dashoffset] duration-200 ease-linear group-hover:duration-300 group-hover:[stroke-dashoffset:0]"
      ></line>

      <line
        x1="20"
        y1="267"
        x2="38"
        y2="267"
        stroke="white"
        strokeWidth={1}
        className=" [stroke-dasharray:18] [stroke-dashoffset:18] transition-[stroke-dashoffset] duration-200 ease-linear group-hover:duration-300 group-hover:[stroke-dashoffset:0]"
      ></line>
      <line
        x1="60"
        y1="307"
        x2="60"
        y2="289"
        stroke="white"
        strokeWidth={1}
        className=" [stroke-dasharray:18] [stroke-dashoffset:18] transition-[stroke-dashoffset] duration-200 ease-linear group-hover:duration-300 group-hover:[stroke-dashoffset:0]"
      ></line>
      <line
        x1="307"
        y1="267"
        x2="289"
        y2="267"
        stroke="white"
        strokeWidth={1}
        className=" [stroke-dasharray:18] [stroke-dashoffset:18] transition-[stroke-dashoffset] duration-200 ease-linear group-hover:duration-300 group-hover:[stroke-dashoffset:0]"
      ></line>
      <line
        x1="267"
        y1="307"
        x2="267"
        y2="289"
        stroke="white"
        strokeWidth={1}
        className=" [stroke-dasharray:18] [stroke-dashoffset:18] transition-[stroke-dashoffset] duration-200 ease-linear group-hover:duration-300 group-hover:[stroke-dashoffset:0]"
      ></line>
    </svg>
  );
}
