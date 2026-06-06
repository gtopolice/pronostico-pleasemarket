"use client";

import React, { useState, useEffect } from "react";
import { Select, SelectProps } from "../select/select";

export interface LanguageSwitcherProps extends Omit<SelectProps, "options" | "onChange" | "value"> {
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
  className?: string;
}

const languageOptions = [
  { label: "ES", value: "es", id: 1 },
  { label: "EN", value: "en", id: 2 },
  { label: "PT", value: "pt", id: 3 },
];

export function LanguageSwitcher({
  currentLocale,
  onLocaleChange,
  className,
  ...rest
}: LanguageSwitcherProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <Select
        options={languageOptions}
        value={currentLocale}
        onChange={onLocaleChange}
        className={className}
        hideBorder
        borderRadius="rounded-full"
        {...rest}
      />
    );
  }

  return (
    <Select
      minWidth="70"
      options={languageOptions}
      value={currentLocale}
      onChange={onLocaleChange}
      className={className}
      hideBorder
      borderRadius="rounded-full"
      {...rest}
    />
  );
}

export default LanguageSwitcher;
