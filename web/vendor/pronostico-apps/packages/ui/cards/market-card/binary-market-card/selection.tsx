import { Button } from "../../../buttons/button";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Skeleton } from "@mui/material";

interface BinarySelectionProps {
  onSelect: (value: "yes" | "no") => void;
  isLoading?: boolean;
  disabled?: boolean;
  labels?: {
    yesLabel?: string;
    noLabel?: string;
  };
}
export function BinarySelection({
  onSelect,
  isLoading,
  disabled,
  labels = {},
}: BinarySelectionProps) {
  const defaultLabels = {
    yesLabel: "Sí",
    noLabel: "No",
  };
  const l = { ...defaultLabels, ...labels };
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSelectYes = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSelect("yes");
  };

  const handleSelectNo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onSelect("no");
  };

  return (
    <div
      className="w-full flex flex-row items-center justify-between gap-2 sm:gap-3"
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-3 mt-[-25px]">
          <Skeleton className="rounded-[8px]" width="100%" height={75} />
          <Skeleton className="rounded-[8px]" width="100%" height={75} />
        </div>
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
  );
}
