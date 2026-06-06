export interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  styles?: React.CSSProperties;
}
export function SectionWrapper({
  children,
  className = "px-4",
  id,
  styles,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`${className || ""} w-full max-w-[1308px] mx-auto overflow-x-hidden flex flex-col gap-3 section-wrapper-no-padding-lg `}
      data-section-wrapper="true"
      style={{
        overflowY: "visible",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE and Edge
        ...styles,
      }}
    >
      {children}
    </section>
  );
}
