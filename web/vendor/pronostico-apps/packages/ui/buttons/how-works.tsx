import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";

export interface HowWorksButtonProps {
  onClick: () => void;
  backgroundColor?: string;
  iconColor?: string;
  label?: string;
}
export function HowWorksButton({
  onClick,
  backgroundColor = "var(--tertiary-container)",
  iconColor = "var(--on-tertiary-container)",
  label = "¿Cómo funciona?",
}: HowWorksButtonProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <IconButton
        className="rounded-full h-[40px] w-[40px]"
        onClick={onClick}
        sx={{
          backgroundColor: backgroundColor,
          "&:hover": {
            backgroundColor: backgroundColor,
            opacity: 0.9,
          },
        }}
      >
        <InfoIcon
          sx={{
            transform: "rotate(180deg)",
            width: 20,
            height: 20,
            color: iconColor,
          }}
        />
      </IconButton>

      <span
        onClick={onClick}
        className="hidden sm:block text-[14px] font-[400] text-[var(--link-color)] text-ellipsis overflow-hidden cursor-pointer"
      >
        {label}
      </span>
    </div>
  );
}
