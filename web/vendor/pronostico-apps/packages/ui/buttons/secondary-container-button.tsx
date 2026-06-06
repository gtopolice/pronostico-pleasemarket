import { Button, ButtonProps } from "@pronostico-apps/ui";

interface Props extends ButtonProps {
    icon?: React.ReactNode;
}
export function SecondaryContainerButton({ icon, label, ...props }: Props) {
    return (
        <Button
            variant="modal"
            className="rounded-full"
            disableElevation
            startIcon={icon}
            {...props}
            // sx={{
            //     height: "40px",
            //     maxWidth: "175px",
            //     boxShadow: "none",
            //     textTransform: "none",
            //     borderColor: "transparent",
            //     borderRadius: "100px",
            //     fontSize: "14px",
            //     fontWeight: "500",
            //     lineHeight: "20px",
            //     backgroundColor: "var(--secondary-container)",
            //     letterSpacing: "0.1px",
            //     color: "var(--primary)",
            //     "& .MuiButton-label": {
            //         textTransform: "none",
            //     },
            //     "& .MuiButton-text": {
            //         textTransform: "none",
            //     },
            //     "&:hover": {
            //         boxShadow: "none",
            //         textTransform: "none",
            //     },
            //     ...props.sx,
            // }}
            style={{ textTransform: "none" }}
            label={label}
        >
        </Button>
    );
}