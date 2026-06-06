import { Accordion as MuiAccordion } from "@mui/material";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRef } from "react";

interface AccordionProps {
  title: string;
  content: React.ReactNode;
  startIcon?: React.ReactNode;
  onChange?: (expanded: boolean) => void;
  accordionRef?: React.RefObject<HTMLDivElement | null>;
}
export default function Accordion({
  title,
  content,
  startIcon,
  onChange,
  accordionRef,
}: AccordionProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = accordionRef || internalRef;

  return (
    <div ref={ref} className="flex flex-col w-full">
      <MuiAccordion
        disableGutters
        elevation={0}
        onChange={(_, expanded) => onChange?.(expanded)}
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          "&::before": {
            display: "none",
          },
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
          "& .MuiAccordionSummary-root": {
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            borderBottom: "1px solid var(--outline-variant)",
            boxShadow: "none",
          },
          "& .MuiAccordionDetails-root": {
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            boxShadow: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ color: "var(--primary)" }} />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <div className="flex items-center gap-2">
            {startIcon && <div className="flex items-center">{startIcon}</div>}
            <Typography
              component="span"
              className="text-[var(--primary)] text-[16px] leading-[24px] tracking-[0.5px] font-[400]"
            >
              {title}
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>{content}</AccordionDetails>
      </MuiAccordion>
    </div>
  );
}
