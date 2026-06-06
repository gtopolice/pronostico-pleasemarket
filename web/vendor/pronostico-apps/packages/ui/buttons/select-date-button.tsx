"use client";

import * as React from "react";
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import { CalendarIcon } from "../assets/icons";
import Box from "@mui/material/Box";

export interface SelectDateButtonProps {
  value?: [Dayjs | null, Dayjs | null];
  onChange?: (value: [Dayjs | null, Dayjs | null]) => void;
  placeholder?: string;
  format?: string;
}

export function SelectDateButton({
  value,
  onChange,
  placeholder = "Rango",
  format = "DD/MM/YYYY",
}: SelectDateButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [confirmedValue, setConfirmedValue] = React.useState<
    [Dayjs | null, Dayjs | null]
  >(value || [null, null]);
  const [tempValue, setTempValue] = React.useState<
    [Dayjs | null, Dayjs | null]
  >(value || [null, null]);
  const [selectingStart, setSelectingStart] = React.useState(true);

  const open = Boolean(anchorEl);

  React.useEffect(() => {
    if (value !== undefined) {
      setConfirmedValue(value);
      setTempValue(value);
    }
  }, [value]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Reset the selection state when the popover is closed
    setSelectingStart(true);
    // Restore the temporary values to the confirmed values
    setTempValue(confirmedValue);
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    if (!newDate) return;

    if (selectingStart) {
      // Selecting the start date
      setTempValue([newDate, null]);
      setSelectingStart(false);
    } else {
      // Selecting the end date
      if (tempValue[0] && newDate.isBefore(tempValue[0])) {
        // If the end date is before the start date, we swap them
        setTempValue([newDate, tempValue[0]]);
        setSelectingStart(true);
      } else {
        // Valid end date
        setTempValue([tempValue[0], newDate]);
        setSelectingStart(true);
      }
    }
  };

  const handleConfirm = () => {
    setConfirmedValue(tempValue);
    onChange?.(tempValue);
    handleClose();
  };

  const handleCancel = () => {
    // Clear all selected dates
    const emptyValue: [Dayjs | null, Dayjs | null] = [null, null];
    setTempValue(emptyValue);
    setConfirmedValue(emptyValue);
    setSelectingStart(true);
    onChange?.(emptyValue);
    handleClose();
  };

  const formatDateRange = (dates: [Dayjs | null, Dayjs | null]): string => {
    const [start, end] = dates;
    if (!start && !end) return "";
    if (start && !end) return `${start.format(format)} - ...`;
    if (start && end) return `${start.format(format)} - ${end.format(format)}`;
    return "";
  };

  const displayText = formatDateRange(confirmedValue) || placeholder;

  // Determine which date to show in the calendar
  const calendarValue = selectingStart ? tempValue[0] : tempValue[0] || dayjs();

  // Check if a date is the start or end date (not the dates in between)
  const isDateInRange = (date: Dayjs): boolean => {
    if (!tempValue[0] || !tempValue[1]) return false;
    // Only mark the start and end dates, not the dates in between
    return date.isSame(tempValue[0], "day") || date.isSame(tempValue[1], "day");
  };

  // Check if a date is the start or end date
  const isStartOrEndDate = (date: Dayjs | null): boolean | null => {
    return (
      (tempValue[0] && date && date.isSame(tempValue[0], "day")) ||
      (tempValue[1] && date && date.isSame(tempValue[1], "day"))
    );
  };

  // Custom day component
  const CustomDay = (props: PickersDayProps & { day: Dayjs }) => {
    const { day, ...other } = props;
    const inRange = isDateInRange(day);
    const isStartOrEnd = isStartOrEndDate(day);

    return (
      <PickersDay
        {...other}
        day={day}
        sx={{
          ...(inRange && {
            backgroundColor: "var(--primary) !important",
            color: "white !important",
            "&:hover": {
              backgroundColor: "var(--primary) !important",
            },
          }),
          ...(isStartOrEnd && {
            backgroundColor: "var(--primary) !important",
            color: "white !important",
            fontWeight: "bold",
          }),
        }}
      />
    );
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outlined"
        startIcon={<CalendarIcon color="var(--primary)" />}
        sx={{
          backgroundColor: "transparent",
          borderColor: "var(--outline)",
          borderRadius: "8px",
          padding: "6px 16px",
          textTransform: "none",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "0.1px",
          color: "var(--on-surface-variant)",
          "&:hover": {
            backgroundColor: "transparent",
            borderColor: "var(--outline)",
          },
          "& .MuiButton-startIcon": {
            marginRight: "8px",
          },
        }}
      >
        {displayText}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            marginTop: "8px",
            borderRadius: "8px",
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Box sx={{ p: 2 }}>
            <DateCalendar
              value={calendarValue}
              onChange={handleDateChange}
              slots={{
                day: CustomDay,
              }}
              sx={{
                "& .MuiPickersCalendarHeader-root": {
                  paddingLeft: "16px",
                  paddingRight: "16px",
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
                pt: 2,
                borderTop: "1px solid var(--outline-variant)",
              }}
            >
              <Button
                onClick={handleCancel}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderColor: "var(--outline)",
                  color: "var(--primary)",
                  borderRadius: "100px",
                  "&:hover": {
                    borderColor: "var(--outline)",
                    backgroundColor: "transparent",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                variant="contained"
                disabled={!tempValue[0] || !tempValue[1]}
                disableElevation
                sx={{
                  textTransform: "none",
                  backgroundColor: "var(--secondary-container)",
                  color: "var(--primary)",
                  borderRadius: "100px",
                  "&:hover": {
                    backgroundColor: "var(--secondary-container)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "var(--surface-variant)",
                    color: "var(--on-surface-variant)",
                  },
                }}
              >
                Seleccionar
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </Popover>
    </>
  );
}
