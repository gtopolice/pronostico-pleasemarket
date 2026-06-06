import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
function SSRInitialFilled(_: BaseNumberField.Root.Props) {
  return null;
}
SSRInitialFilled.muiName = "Input";

export interface AmountInputProps extends BaseNumberField.Root.Props {
  label?: React.ReactNode;
  size?: "small" | "medium";
  error?: boolean;
  sx?: any;
  className?: string;
}

export default function NumberField({
  id: idProp,
  label,
  error,
  size = "medium",
  sx: sxProp,
  className,
  ...other
}: AmountInputProps) {
  let id = React.useId();
  if (idProp) {
    id = idProp;
  }

  return (
    <BaseNumberField.Root
      {...other}
      className={className}
      render={(props, state) => (
        <FormControl
          size={size}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant="standard"
          fullWidth
          className={className}
        >
          {props.children}
        </FormControl>
      )}
    >
      <SSRInitialFilled {...other} />
      {label && (
        <InputLabel
          htmlFor={id}
          sx={{
            color: "var(--on-surface-variant)",
            "&.Mui-focused": {
              color: "var(--primary)",
            },
          }}
        >
          {label}
        </InputLabel>
      )}
      <BaseNumberField.Input
        id={id}
        render={(props, state) => (
          <Input
            type="text"
            inputMode="decimal"
            inputRef={props.ref}
            value={state.inputValue}
            onBlur={props.onBlur}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            onKeyDown={props.onKeyDown}
            onFocus={props.onFocus}
            slotProps={{
              input: { ...props, type: "text", inputMode: "decimal" },
            }}
            sx={{
              pr: 0,
              width: "100px",
              color: "var(--primary)",
              fontFamily: "inherit",
              fontWeight: "inherit",
              fontSize: "inherit",
              "&::before": {
                borderBottomColor: "var(--outline-variant)",
              },
              "&:hover:not(.Mui-disabled)::before": {
                borderBottomColor: "var(--on-surface)",
              },
              "&::after": {
                borderBottomColor: "var(--primary)",
              },
              "& input": {
                color: "var(--primary)",
                caretColor: "var(--primary)",
                textAlign: "inherit",
              },
              ...sxProp,
            }}
          />
        )}
      />
    </BaseNumberField.Root>
  );
}
