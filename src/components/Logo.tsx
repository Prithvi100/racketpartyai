interface Props {
  size?: number;
  className?: string;
}

export default function Logo({ size = 28, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="#c4ff3e" strokeWidth="1.5" />
        <path
          d="M11 7.5 C8 11 8 17 11 22 M21 7.5 C24 11 24 17 21 22 M9 11 H23 M9 14 H23 M9 17 H23 M9 20 H23 M11 9 V21 M14 8 V22 M18 8 V22 M21 9 V21"
          stroke="#c4ff3e"
          strokeWidth="0.9"
          opacity="0.85"
        />
        <circle cx="22.5" cy="22.5" r="3" fill="#d97742" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">
        RacketParty
        <span className="text-court">.</span>
        <span className="text-ink-400 text-sm font-normal ml-0.5">ai</span>
      </span>
    </div>
  );
}
