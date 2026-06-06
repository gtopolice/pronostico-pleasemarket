"use client";

import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "modal";
export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  label: string;
  labelBottom?: string;
  variant?: ButtonVariant;
  isActive?: boolean;
}
export function Button({
  label,
  labelBottom,
  variant = "primary",
  className,
  isActive = false,
  startIcon,
  endIcon,
  disabled,
  ...props
}: ButtonProps) {
  const sxProps = props.sx || {};
  delete props.sx;

  const buttonColor = (disabled?: boolean) => {
    switch (true) {
      // variant primary not active
      case variant === "primary" && !isActive:
        return {
          backgroundColor: disabled ? "var(--primary-button-bg-disabled)" : "var(--primary-button-bg)",
          color: disabled ? "var(--text-on-primary-button-disabled)" : "var(--text-on-primary-button)",
          labelBottomColor: disabled ? "var(--text-on-primary-button-disabled)" : "var(--text-on-primary-button)",
          bgHover: disabled ? "var(--primary-button-bg-disabled)" : "var(--primary-button-bg-active)",
          colorHover: disabled ? "var(--text-on-primary-button-disabled)" : "var(--text-on-primary-button-active)",
        };
      // variant and active
      case variant === "primary" && isActive:
        return {
          backgroundColor: disabled ? "var(--primary-button-bg-disabled)" : "var(--primary-button-bg-active)",
          color: disabled ? "var(--text-on-primary-button-disabled)" : "var(--text-on-primary-button-active)",
          labelBottomColor: disabled ? "var(--text-on-primary-button-disabled)" : "var(--text-on-primary-button-active)",
          bgHover: disabled ? "var(--primary-button-bg-disabled)" : "var(--primary-button-bg-active)",
        };
      // variant secondary not active
      case variant === "secondary" && !isActive:
        return {
          backgroundColor: disabled ? "var(--secondary-button-bg-disabled)" : "var(--secondary-button-bg)",
          color: disabled ? "var(--text-on-secondary-button-disabled)" : "var(--text-on-secondary-button)",
          labelBottomColor: disabled ? "var(--text-on-secondary-button-disabled)" : "var(--text-on-secondary-button)",
          bgHover: disabled ? "var(--secondary-button-bg-disabled)" : "var(--secondary-button-bg-active)",
          colorHover: disabled ? "var(--text-on-secondary-button-disabled)" : "var(--text-on-secondary-button-active)",
        };
      // variant secondary active
      case variant === "secondary" && isActive:
        return {
          backgroundColor: disabled ? "var(--secondary-button-bg-disabled)" : "var(--secondary-button-bg-active)",
          color: disabled ? "var(--text-on-secondary-button-disabled)" : "var(--text-on-secondary-button-active)",
          labelBottomColor: disabled ? "var(--text-on-secondary-button-disabled)" : "var(--text-on-secondary-button-active)",
        };
      // variant tertiary not active
      case variant === "tertiary" && !isActive:
        return {
          backgroundColor: disabled ? "var(--tertiary-button-bg-disabled)" : "var(--tertiary-button-bg)",
          color: disabled ? "var(--text-on-tertiary-button-disabled)" : "var(--text-on-tertiary-button)",
        };
      // variant tertiary active
      case variant === "tertiary" && isActive:
        return {
          backgroundColor: disabled ? "var(--tertiary-button-bg-disabled)" : "var(--tertiary-button-bg-active)",
          color: disabled ? "var(--text-on-tertiary-button-disabled)" : "var(--text-on-tertiary-button-active)",
        };
      // variant outline not active
      case variant === "outline" && !isActive:
        return {
          backgroundColor: disabled ? "var(--outline-button-bg-disabled)" : "transparent",
          color: disabled ? "var(--text-on-outline-button-disabled)" : "var(--on-surface)",
          border: "1px solid var(--outline-variant)",
        };
      // variant outline active
      case variant === "outline" && isActive:
        return {
          backgroundColor: disabled ? "var(--outline-button-bg-disabled)" : "var(--outline-variant-active)",
          color: disabled ? "var(--text-on-outline-button-disabled)" : "var(--text-on-outline-button-active)",
          border: "1px solid var(--outline-variant)",
        };
      case variant === "modal" && !isActive:
        return {
          backgroundColor: disabled ? "var(--modal-button-bg-disabled)" : "var(--modal-button-bg)",
          color: disabled ? "var(--text-on-modal-button-disabled)" : "var(--text-on-modal-button)",
        };
      default:
        return {
          backgroundColor: disabled ? "var(--primary-button-bg-disabled)" : "var(--primary-button-bg)",
          color: disabled ? "var(--text-on-primary-button-disabled)" : "var(--text-on-primary-button)",
          labelBottomColor: disabled ? "var(--text-on-primary-button-disabled)" : "var(--text-on-primary-button)",
        };
    }
  };


  // Extract padding values from sxProps if they exist
  const customPadding = (sxProps as any)?.padding;
  const customPaddingTop = (sxProps as any)?.paddingTop;
  const customPaddingBottom = (sxProps as any)?.paddingBottom;
  const customPaddingLeft = (sxProps as any)?.paddingLeft;
  const customPaddingRight = (sxProps as any)?.paddingRight;
  const customMinWidth = (sxProps as any)?.minWidth;

  // Build small size styles
  const smallSizeStyles: any = {};
  if (customPadding) {
    const paddingValue = String(customPadding).includes("!important")
      ? customPadding
      : `${customPadding} !important`;
    smallSizeStyles.padding = paddingValue;
  }
  if (customPaddingTop) {
    const paddingTopValue = String(customPaddingTop).includes("!important")
      ? customPaddingTop
      : `${customPaddingTop} !important`;
    smallSizeStyles.paddingTop = paddingTopValue;
  }
  if (customPaddingBottom) {
    const paddingBottomValue = String(customPaddingBottom).includes(
      "!important"
    )
      ? customPaddingBottom
      : `${customPaddingBottom} !important`;
    smallSizeStyles.paddingBottom = paddingBottomValue;
  }
  if (customPaddingLeft) {
    const paddingLeftValue = String(customPaddingLeft).includes("!important")
      ? customPaddingLeft
      : `${customPaddingLeft} !important`;
    smallSizeStyles.paddingLeft = paddingLeftValue;
  }
  if (customPaddingRight) {
    const paddingRightValue = String(customPaddingRight).includes("!important")
      ? customPaddingRight
      : `${customPaddingRight} !important`;
    smallSizeStyles.paddingRight = paddingRightValue;
  }
  if (customMinWidth !== undefined) {
    const minWidthValue = String(customMinWidth).includes("!important")
      ? customMinWidth
      : `${customMinWidth} !important`;
    smallSizeStyles.minWidth = minWidthValue;
  }

  return (
    <MuiButton
      variant={variant === "outline" ? "outlined" : "contained"}
      disableElevation
      className={`w-full h-[50px] border-none rounded-btn ${className}`}
      sx={{
        boxShadow: "none",
        textTransform: "none",
        fontSize: "14px",
        fontWeight: "700",
        lineHeight: "20px",
        letterSpacing: "0.1px",
        borderRadius: className?.includes("rounded-full") ? "100px" : "10px",
        height: "50px",
        ...buttonColor(disabled),
        "&:hover": {
          boxShadow: "none",
          backgroundColor: buttonColor().bgHover,
          color: buttonColor().colorHover,
        },
        "&:disabled": {
          ...buttonColor(true),
        },
        ...sxProps,
        "&.MuiButton-sizeSmall": {
          ...smallSizeStyles,
          ...((sxProps as any)?.["&.MuiButton-sizeSmall"] || {}),
        },
      }}
      {...props}
      disabled={disabled}
    >
      <span className="flex flex-col items-center justify-center">
        <span className="flex flex-row items-center justify-center gap-1.5">
          {startIcon && <span className="flex items-center justify-center">{startIcon}</span>}
          <span className="flex items-center justify-center leading-none">{label}</span>
          {endIcon && <span className="flex items-center justify-center">{endIcon}</span>}
        </span>
        {labelBottom && (
          <span
            style={{
              color: disabled ? "" : buttonColor().labelBottomColor,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "0.4px",
              fontWeight: "400",
            }}
          >
            {labelBottom}
          </span>
        )}
      </span>
    </MuiButton>
  );
}
