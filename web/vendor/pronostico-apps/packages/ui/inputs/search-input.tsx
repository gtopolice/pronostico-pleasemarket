"use client";

import SearchIcon from "@mui/icons-material/Search";
import { CircularProgress, InputAdornment } from "@mui/material";
import { Input } from "./input";

export interface SearchInputProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  className?: string;
  isSearching?: boolean;
}

export function SearchInput({
  placeholder = "Busca un mercado",
  value,
  onChange,
  onSearch,
  className,
  isSearching,
  ...props
}: SearchInputProps) {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && onSearch && value) {
      onSearch(value);
    }
  };

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={handleKeyPress}
      className={`w-full max-w-[473.39px] ${className}`}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "var(--search-input-bg) !important",
          borderRadius: "28px !important",
          height: "40px !important",
          "& fieldset": {
            display: "none",
          },
          "&:hover fieldset": {
            display: "none",
          },
          "&.Mui-focused fieldset": {
            display: "none",
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "28px !important",
        },
        "& .MuiInputBase-root": {
          borderRadius: "28px !important",
        },
        "& .MuiInputBase-input": {
          borderRadius: "28px !important",
          color: "var(--search-input-text-color) !important",
        },
        "& .MuiOutlinedInput-input": {
          color: "var(--search-input-text-color) !important",
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "var(--search-input-text-color)" }} />
          </InputAdornment>
        ),
        endAdornment: isSearching && (
          <InputAdornment position="end">
            <CircularProgress
              sx={{ color: "var(--search-input-text-color)" }}
              size={20}
            />
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
}
