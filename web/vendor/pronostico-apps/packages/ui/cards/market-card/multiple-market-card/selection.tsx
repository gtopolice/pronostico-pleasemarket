import { MultiSelectOptions } from "../types/interfaces";
import { Button } from "../../../buttons/button";

export function MultipleSelection({ option }: { option?: MultiSelectOptions }) {
  const sx = {
    height: "28px",
    borderRadius: "5px",
    minWidth: "25px",
    fontSize: "12px",
  };
  return (
    <div className="w-full flex flex-row items-center justify-between">
      {option && (
        <span className="text-[var(--predictions-card-title)] text-[12px] leading-[16px] tracking-[0.4px] font-[400]">
          {option.label}
        </span>
      )}
      <div className="flex flex-row items-center justify-center gap-1">
        {option && (
          <span className="text-[var(--predictions-card-title)] text-[12px] leading-[16px] tracking-[0.4px] font-[400]">
            {option.label}
          </span>
        )}

        <Button className="small-button" label="Si" variant="primary" sx={sx} />
        <Button
          className="small-button"
          label="No"
          variant="secondary"
          sx={sx}
        />
      </div>
    </div>
  );
}
