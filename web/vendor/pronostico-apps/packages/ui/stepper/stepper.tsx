"use client";

import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/Check";

interface Step {
  label: string;
  description: string;
  isCompleted?: boolean;
}

interface StepperProps {
  steps: Step[];
  labelStyle?: React.CSSProperties;
  descriptionStyle?: React.CSSProperties;
  variant?: "default" | "primary";
  stepHeight?: number;
}

export function Stepper({
  steps,
  labelStyle,
  descriptionStyle,
  variant = "default",
  stepHeight = 70,
}: StepperProps) {
  const isPrimary = variant === "primary";
  const completedColor = isPrimary
    ? "var(--tertiary-container)"
    : "var(--secondary-container)";
  const iconColor = isPrimary ? "var(--on-tertiary-container)" : "#000000";

  return (
    <div style={{ maxWidth: "400px" }}>
      {steps.map((step, index) => {
        const nextStepCompleted =
          index < steps.length - 1 ? steps[index + 1]?.isCompleted : false;
        const isLastStep = index === steps.length - 1;

        return (
          <div
            key={step.label}
            className="flex relative flex-row"
            style={{ height: `${isLastStep ? 45 : stepHeight}px` }}
          >
            {/* Icon container */}
            <div className="flex flex-col items-center mr-4 relative min-h-full">
              <IconButton
                disabled
                sx={{
                  width: "26px",
                  height: "26px",
                  padding: 0,
                  backgroundColor: step.isCompleted
                    ? completedColor
                    : "var(--on-primary-container)",
                  "&:disabled": {
                    backgroundColor: step.isCompleted
                      ? completedColor
                      : "var(--on-primary-container)",
                  },
                  position: "relative",
                  zIndex: 1,
                  flexShrink: 0,
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: "17px",
                    fontWeight: "bold",
                    color: iconColor,
                  }}
                />
              </IconButton>
              {/* Connector line */}
              {!isLastStep && step.isCompleted && (
                <div
                  style={{
                    width: "2px",
                    position: "absolute",
                    top: "26px",
                    left: "12px",
                    bottom: nextStepCompleted ? 0 : "25%",
                    backgroundColor: completedColor,
                  }}
                />
              )}
            </div>

            {/* Content container */}
            <div className="flex flex-col gap-0 flex-1">
              {/* Label */}
              <div>
                <span
                  className="text-[var(--primary)] font-700 text-16px leading-24px tracking-0.5px"
                  style={labelStyle}
                >
                  {step.label}
                </span>
              </div>
              {/* Description */}
              <div>
                <span
                  className="text-[var(--surface-tint)] font-400 text-14px leading-20px tracking-0.25px"
                  style={descriptionStyle}
                >
                  {step.description}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
