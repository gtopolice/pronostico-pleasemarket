"use client";

interface ButtonTabsProps {
  options: {
    label: string;
    value: string;
    id: number;
  }[];
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
  rightComponent?: React.ReactNode;
}
export function ButtonTabs({
  options,
  selectedTab,
  setSelectedTab,
  rightComponent,
}: ButtonTabsProps) {
  const selectedColor = (item: number) => {
    if (item === selectedTab) return "var(--primary)";
    return "var(--on-surface-variant)";
  };

  return (
    <div className="border-b border-b-[0.5px] border-[var(--outline-variant)] relative h-[48px]">
      <div className="flex flex-row items-center justify-between gap-4 px-5">
        <div className="flex flex-row items-center gap-4">
          {options.map((option) => (
            <div
              key={option.id}
              className="h-[48px] flex flex-col justify-center items-center cursor-pointer pb-0 relative w-auto"
              onClick={() => setSelectedTab(option.id)}
            >
              <span
                className={`text-[14px] leading-[20px] tracking-[0.1px] font-[500] text-[${selectedColor(option.id)}]`}
              >
                {option.label}
              </span>
              {selectedTab === option.id && (
                <span
                  className={
                    "h-[3px] bg-[var(--primary)] rounded-tl-[100px] rounded-tr-[100px] mt-0 w-[100%] absolute bottom-0"
                  }
                />
              )}
            </div>
          ))}
        </div>
        {rightComponent && rightComponent}
      </div>
    </div>
  );
}
