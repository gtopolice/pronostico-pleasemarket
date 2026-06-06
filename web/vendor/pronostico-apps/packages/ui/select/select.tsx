import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import { SelectChangeEvent } from "@mui/material/Select";
import { Select as MuiSelect, PopoverOrigin } from "@mui/material";

export interface SelectProps {
  options: {
    label: string;
    value: string;
    id: number;
  }[];
  onChange?: (value: string) => void;
  hideBorder?: boolean;
  borderRadius?: string;
  iconStart?: React.ReactNode;
  value?: string;
  className?: string;
  minWidth?: string;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
}
export function Select({
  options,
  onChange,
  hideBorder = false,
  borderRadius,
  iconStart,
  value,
  className,
  minWidth,
  anchorOrigin = { vertical: "bottom", horizontal: "left" },
  transformOrigin = { vertical: "top", horizontal: "left" },
}: SelectProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={className}>
      <FormControl sx={{ minWidth: minWidth ?? 91, height: 32 }}>
        <MuiSelect
          value={value}
          onChange={handleChange}
          displayEmpty
          variant="outlined"
          inputProps={{ "aria-label": "Without label" }}
          className="p-0 w-full h-full"
          startAdornment={
            iconStart ? (
              <InputAdornment position="start" sx={{ marginRight: 1 }}>
                {iconStart}
              </InputAdornment>
            ) : undefined
          }
          MenuProps={{
            anchorOrigin,
            transformOrigin,
            slotProps: {
              paper: {
                sx: {
                  marginTop: "8px",
                  minWidth: "160px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                  backgroundColor: "var(--surface-container-low)",
                  border: "1px solid var(--outline-variant)",
                  "& .MuiMenuItem-root": {
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    letterSpacing: "0.25px",
                    color: "var(--on-surface)",
                    "&:hover": {
                      backgroundColor: "var(--surface-container-high) !important",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "var(--surface-container-highest) !important",
                      color: "var(--on-surface)",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "var(--surface-container-highest) !important",
                      },
                    },
                    "&.Mui-focusVisible": {
                      backgroundColor: "transparent",
                    },
                  },
                },
              },
            },
          }}
          sx={{
            "& .MuiSelect-select": {
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              letterSpacing: "0.1px",
              color: "var(--on-surface-variant)",
              borderRadius: borderRadius,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: hideBorder ? "transparent" : "var(--outline)",
              borderWidth: hideBorder ? 0 : 1,
              display: hideBorder ? "none" : "block",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: hideBorder ? "transparent" : "var(--outline)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: hideBorder ? "transparent" : "var(--outline)",
            },
            "& .MuiSelect-icon": {
              color: "var(--on-surface-variant)",
            },
            "&.Mui-focused": {
              outline: "none",
            },
            "&:focus": {
              outline: "none",
            },
          }}
        >
          {options.map((option) => (
            <MenuItem
              className="select-text"
              key={option.id}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    </div>
  );
}