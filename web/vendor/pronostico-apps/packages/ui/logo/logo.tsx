import Image from "next/image";

interface LogoProps {
  onClick?: () => void;
  variant?: "black" | "white" | "auto";
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({
  onClick,
  variant = "auto",
  width = 153,
  height = 24,
  className = "",
}: LogoProps) {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer flex items-center justify-center shrink-0 transition-all duration-300 hover:opacity-90 active:scale-95 ${className}`}
    >
      {(variant === "auto" || variant === "black") && (
        <Image
          src="/assets/pronostico-logo-black.png"
          alt="Pronóstico"
          width={width}
          height={height}
          className={`logo-img-black object-contain h-auto ${className}`}
          priority
        />
      )}
      {(variant === "auto" || variant === "white") && (
        <Image
          src="/assets/pronostico-logo-white.png"
          alt="Pronóstico"
          width={width}
          height={height}
          className={`logo-img-white object-contain h-auto ${className}`}
          priority
        />
      )}
    </div>
  );
}
