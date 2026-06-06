"use client";

import { TagButton, TagButtonProps } from "../buttons/tag-button";
import { Select, SelectProps } from "../select/select";
import { MainScroll } from "../scroll/main-scroll";

interface FiltersBarProps {
  selectOptions: SelectProps["options"];
  tagButtons: TagButtonProps[];
  selectedTagButton: string;
  onChangeSelectOption: (value: string) => void;
  onChangeTagButton: (id: string) => void;
}

export function FiltersBar({
  selectOptions,
  tagButtons,
  selectedTagButton,
  onChangeSelectOption,
  onChangeTagButton,
}: FiltersBarProps) {
  return (
    <div className="flex flex-row items-start justify-start gap-2">
      {selectOptions.length > 0 && (
        <Select options={selectOptions} onChange={onChangeSelectOption} />
      )}
      {tagButtons.length > 0 && (
        <MainScroll
          items={tagButtons.map((tagButton) => (
            <TagButton
              key={tagButton.label}
              isSelected={selectedTagButton === tagButton.id}
              onClick={() => onChangeTagButton(tagButton.id)}
              label={tagButton.label}
              id={tagButton.id}
            />
          ))}
          direction="horizontal"
          showControls={false}
          showIndicators={false}
          gap={8}
        />
      )}
    </div>
  );
}
