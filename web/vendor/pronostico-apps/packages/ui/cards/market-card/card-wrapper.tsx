"use client";

interface CardWrapperProps {
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  isMarked?: boolean;
}
export function CardWrapper({
  children,
  onClick,
  isSelected,
  isMarked,
}: CardWrapperProps) {
  return (
    <div
      className="w-full sm:w-[318px] sm:max-w-[318px] h-auto sm:h-[181px] cursor-pointer rounded-[12px] border border-[var(--border-card-color)] p-3 overflow-hidden"
      onClick={onClick}
    >
      <div
        className={`flex flex-col items-center gap-${isSelected || isMarked ? 3 : 5}`}
      >
        {children}
      </div>
    </div>
  );
}
