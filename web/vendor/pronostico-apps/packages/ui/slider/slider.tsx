import {
  Slider as MuiSlider,
  SliderProps as MuiSliderProps,
} from "@mui/material";

export function Slider(props: MuiSliderProps) {
  const { sx, valueLabelDisplay = "auto", ...otherProps } = props;
  return (
    <MuiSlider
      aria-label={props["aria-label"] || "Slider"}
      valueLabelDisplay={valueLabelDisplay}
      sx={{
        "& .MuiSlider-thumb": {
          backgroundColor: "#2C2C2C",
          height: "16px",
          width: "16px",
          "&:hover": {
            backgroundColor: "#2C2C2C",
            boxShadow: "0px 0px 0px 8px rgba(44, 44, 44, 0.16)",
          },
          "&.Mui-active": {
            boxShadow: "0px 0px 0px 14px rgba(44, 44, 44, 0.16)",
          },
        },
        "& .MuiSlider-track": {
          backgroundColor: "#2C2C2C",
          border: "none",
          height: "8px",
        },
        "& .MuiSlider-rail": {
          backgroundColor: "#BCBCBC",
          height: "8px",
        },
        ...sx,
      }}
      {...otherProps}
    />
  );
}
