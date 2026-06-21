// Gemini logo SVG — the official four-pointed star shape
// Rendered as an inline SVG to match sidebar icon sizing

type Props = {
  size?: number;
  /** pass a single color to override the gradient (e.g. for muted state) */
  color?: string;
  id?: string; // unique gradient id so multiple instances don't clash
};

export function GeminiIcon({ size = 20, color, id = "gem" }: Props) {
  // The Gemini mark is a four-pointed star / elongated diamond cross
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Gemini"
    >
      {!color && (
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="50%" stopColor="#9B72CB" />
            <stop offset="100%" stopColor="#D96570" />
          </linearGradient>
        </defs>
      )}
      {/*
        Four-pointed star: two overlapping ellipses rotated 90° from each other.
        Top/bottom lobe taller, left/right lobe wider — the Gemini proportions.
      */}
      <path
        d="M14 2
           C14 2 15.6 8.8 18.4 11.6
           C21.2 14.4 26 14 26 14
           C26 14 21.2 13.6 18.4 16.4
           C15.6 19.2 14 26 14 26
           C14 26 12.4 19.2 9.6 16.4
           C6.8 13.6 2 14 2 14
           C2 14 6.8 14.4 9.6 11.6
           C12.4 8.8 14 2 14 2Z"
        fill={color ?? `url(#${id}-grad)`}
      />
    </svg>
  );
}
