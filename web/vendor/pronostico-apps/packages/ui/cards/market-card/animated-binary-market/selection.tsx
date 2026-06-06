import { Button } from "../../../buttons/button";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Skeleton } from "@mui/material";

interface SelectionProps {
    onSelect: (value: "yes" | "no") => void;
    disabled?: boolean;
    isLoading?: boolean;
    labels?: {
        yesLabel?: string;
        noLabel?: string;
    };
}

export function Selection({ onSelect, disabled, isLoading, labels = {} }: SelectionProps) {
    const defaultLabels = {
        yesLabel: "Sí",
        noLabel: "No",
    };
    const l = { ...defaultLabels, ...labels };
    const handleSelectYes = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onSelect("yes");
    };

    const handleSelectNo = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onSelect("no");
    };

    return (
        <div className="flex flex-row items-center justify-between gap-2">
            {isLoading ? (
                <>
                    <Skeleton className="rounded-full" width="100%" height={50} />
                    <Skeleton className="rounded-full" width="100%" height={50} />
                </>
            ) : (
                <>
                    <Button
                        className="rounded-full"
                        label={l.yesLabel}
                        startIcon={<CheckIcon />}
                        onClick={handleSelectYes}
                        disabled={disabled}
                    />
                    <Button
                        className="rounded-full"
                        label={l.noLabel}
                        variant="secondary"
                        startIcon={<CloseIcon />}
                        onClick={handleSelectNo}
                        disabled={disabled}
                    />
                </>
            )}
        </div>
    )
}