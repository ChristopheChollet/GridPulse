export function GridPulseLogo({
  size = "md",
  showWordmark = false,
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}) {
  const dim = size === "sm" ? 28 : size === "lg" ? 40 : 32;

  return (
    <span className="gridpulse-logo">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="32" height="32" rx="8" fill="#059669" />
        <path
          d="M6 22 L11 16 L16 19 L22 10 L26 14"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="26" cy="14" r="2" fill="white" fillOpacity="0.95" />
      </svg>
      {showWordmark ? (
        <span className="gridpulse-wordmark">
          Grid<span className="gridpulse-wordmark-accent">Pulse</span>
        </span>
      ) : null}
    </span>
  );
}
