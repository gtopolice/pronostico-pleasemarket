import { Button } from "../../../buttons/button";
import { Team } from "../types/interfaces";
import { Skeleton } from "@mui/material";
interface Props {
  teams: Team[] | undefined;
  isLoading?: boolean;
}
export function ScalarSelection({ teams, isLoading }: Props) {
  const team1 = teams && teams.length > 0 ? teams[0] : null;
  const team2 = teams && teams.length > 1 ? teams[1] : null;

  const sx = {
    height: "38px",
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "16px",
    letterSpacing: "0.5px",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    color: "text-[var(--predictions-card-title)]",
  };

  return (
    <div className="w-full flex flex-row items-center justify-between gap-2">
      {isLoading || !team1 ? (
        <Skeleton className="rounded-[8px]" width={100} height={40} />
      ) : (
        <Button label={team1.name} variant="tertiary" sx={sx} />
      )}
      {isLoading || !team2 ? (
        <Skeleton className="rounded-[8px]" width={100} height={40} />
      ) : (
        <Button label={"Empate"} variant="tertiary" sx={sx} />
      )}
      {isLoading || !team2 ? (
        <Skeleton className="rounded-[8px]" width={100} height={40} />
      ) : (
        <Button label={team2.name} variant="tertiary" sx={sx} />
      )}
    </div>
  );
}
