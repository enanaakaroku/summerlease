export default function CrossPSvg({
  width = "16px",
  height = "16px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500.01 499.01"
      width={width}
      height={height}
    >
      <defs></defs>
      <title>ICONp</title>
      <g id="图层_4" data-name="图层 4">
        <rect fill="white" x="144.01" y="143.51" width="216" height="216" />
        <rect
          fill="white"
          x="377"
          y="-25"
          width="36"
          height="261"
          transform="translate(190.3 -248.9) rotate(45)"
        />
        <rect
          fill="white"
          x="87"
          y="264"
          width="36"
          height="261"
          transform="translate(309.71 40.81) rotate(45)"
        />
        <rect
          fill="white"
          x="87"
          y="-25"
          width="36"
          height="261"
          transform="translate(-43.84 104.65) rotate(-45)"
        />
        <rect
          fill="white"
          x="377"
          y="264"
          width="36"
          height="261"
          transform="translate(-163.26 394.36) rotate(-45)"
        />
      </g>
    </svg>
  );
}
