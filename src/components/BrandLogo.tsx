interface BrandLogoProps {
  size?: "sm" | "md";
}

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  const starSize = size === "sm" ? 28 : 34;

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {/* Səkkizguşəli qırmızı ulduz + ağ Play işarəsi */}
      <svg
        width={starSize}
        height={starSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 drop-shadow-[0_2px_8px_rgba(229,9,20,0.45)] transition-transform duration-200 group-hover:scale-105"
      >
        {/* Səkkizguşəli ulduz (16 təpə nöqtəsi) */}
        <polygon
          points="18,1 22.1,9.9 30,6 26.1,13.9 35,18 26.1,22.1 30,30 22.1,26.1 18,35 13.9,26.1 6,30 9.9,22.1 1,18 9.9,13.9 6,6 13.9,9.9"
          fill="#E50914"
        />
        {/* Daxili incə kölgə halqası */}
        <polygon
          points="18,4.2 21.3,11.2 27.7,8.3 24.8,14.7 31.8,18 24.8,21.3 27.7,27.7 21.3,24.8 18,31.8 14.7,24.8 8.3,27.7 11.2,21.3 4.2,18 11.2,14.7 8.3,8.3 14.7,11.2"
          fill="#C90812"
        />
        {/* Ağ Play üçbucağı */}
        <path d="M14.8 12.2L24.2 18L14.8 23.8V12.2Z" fill="#FFFFFF" />
      </svg>

      {/* AZFLIX (Netflix üslubunda böyük) + Azərbaycan (nisbətən kiçik) */}
      <span className="inline-flex items-baseline gap-1.5 leading-none">
        <span
          className={`font-brand uppercase tracking-[0.08em] text-accent drop-shadow-[0_2px_6px_rgba(229,9,20,0.35)] ${
            size === "sm" ? "text-2xl" : "text-[28px] sm:text-[34px]"
          }`}
        >
          AZFLIX
        </span>
        <span
          className={`font-display font-bold tracking-tight text-foreground ${
            size === "sm" ? "text-xs" : "text-xs sm:text-sm"
          }`}
        >
          Azərbaycan
        </span>
      </span>
    </span>
  );
}
