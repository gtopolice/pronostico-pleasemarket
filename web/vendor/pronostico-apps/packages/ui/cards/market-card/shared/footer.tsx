import RepeatIcon from "@mui/icons-material/Repeat";
import ReactCountryFlag from "react-country-flag";
import { MarketCardProps } from "../types/interfaces";
import { Skeleton } from "@mui/material";
import { SaveButton } from "../../../buttons/save-button";

export function Footer(props?: MarketCardProps | undefined) {
  const { isLoading } = props ?? {};

  if (isLoading) {
    return (
      <div className="flex flex-row items-center justify-between w-full px-1 gap-5">
        <Skeleton className="rounded-[8px]" width="100%" height={20} />
        <Skeleton className="rounded-[8px]" width="100%" height={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-between w-full px-1">
      <div className="flex flex-row items-center justify-start gap-1">
        {props?.volume && (
          <p className="text-[var(--label-text-color)] text-[12px] leading-[16px] tracking-[0.4px] font-[400]">
            ${props?.volume} {props?.volume && "Vol"}
          </p>
        )}
        {props?.enableRepeat && (
          <div>
            <RepeatIcon
              style={{ fontSize: 20, fontWeight: 900 }}
              className="text-[var(--primary-icon)] cursor-pointer"
            />
          </div>
        )}
        {props?.countryCode && (
          <>
            <span className="text-[var(--label-text-color)] text-[12px] leading-[16px] tracking-[0.4px] font-[400]">
              {" "}
              {"•"}{" "}
            </span>
            <ReactCountryFlag
              countryCode={props?.countryCode}
              svg
              style={{ width: "0.8em", height: "0.8em" }}
              title="country Code"
            />
          </>
        )}
        {props?.serie && props?.openTimeUtc && (
          <p className="text-[var(--label-text-color)] text-[12px] leading-[16px] tracking-[0.4px] font-[400]">
            {props.serie} {"•"} {props.openTimeUtc}
          </p>
        )}
      </div>
      {props?.showSaveButton && (
        <SaveButton
          isActivated={props?.is_marked}
          onlyIcon={true}
          activeColor="var(--tertiary)"
          inactiveColor="var(--secondary-icon)"
          showFilledIconWhenActivated={true}
          onClick={(e) => {
            e.stopPropagation();
            props?.onBookMark?.(!props?.is_marked);
          }}
        />
      )}
    </div>
  );
}
