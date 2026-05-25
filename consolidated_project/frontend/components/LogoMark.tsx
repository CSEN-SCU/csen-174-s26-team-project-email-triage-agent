import Image from "next/image";

export function LogoMark({
  className = "",
  bare = false,
}: {
  className?: string;
  bare?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`relative shrink-0 overflow-hidden ${
        bare
          ? ""
          : "rounded-md ring-1 ring-ink/8 bg-white/80 shadow-sm"
      } ${className}`}
    >
      <Image
        src="/triage_symbol.png"
        alt=""
        fill
        sizes="28px"
        className="object-cover"
      />
    </span>
  );
}
