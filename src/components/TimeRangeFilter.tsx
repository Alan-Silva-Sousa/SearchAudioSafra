import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckIcon from "@mui/icons-material/Check";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, "0");
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

function maskTime(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function TimeSelect({
  label,
  value,
  onChange,
  dark = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  dark?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value || "");

  useEffect(() => {
    setText(value || "");
  }, [value]);

  const commit = (raw: string) => {
    const masked = maskTime(raw);
    if (!masked) {
      onChange("");
      setText("");
      return;
    }
    if (isValidTime(masked)) {
      onChange(masked);
      setText(masked);
      return;
    }
    setText(value || "");
  };

  const accent = dark ? "#4ea3ff" : "#0d4f8b";
  const textColor = dark ? "#e9eef5" : "text.primary";
  const paperBg = dark ? "#0b1d36" : "#fff";
  const optionColor = dark ? "#e9eef5" : "#0d4f8b";

  return (
    <Autocomplete
      freeSolo
      fullWidth
      disabled={disabled}
      open={open && !disabled}
      onOpen={() => {
        if (!disabled) setOpen(true);
      }}
      onClose={() => setOpen(false)}
      options={TIME_OPTIONS}
      value={value || null}
      inputValue={text}
      onInputChange={(_, next, reason) => {
        if (reason === "reset") return;
        setText(maskTime(next));
      }}
      onChange={(_, next) => {
        const masked = typeof next === "string" ? maskTime(next) : "";
        if (!masked || isValidTime(masked)) {
          onChange(masked);
          setText(masked);
        }
      }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: paperBg,
            color: optionColor,
            "& .MuiAutocomplete-option": {
              color: optionColor,
              fontWeight: 500,
              '&[aria-selected="true"]': { bgcolor: dark ? "#122a48" : "#F3F4F6" },
              "&.Mui-focused": { bgcolor: dark ? "#0d4f8b" : "#E8F1FB" },
            },
          },
        },
        listbox: { sx: { maxHeight: 280 } },
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props as any;
        const selected = option === value;
        return (
          <Box
            component="li"
            key={key ?? option}
            {...rest}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: selected ? 700 : 500,
            }}
          >
            {option}
            {selected ? <CheckIcon sx={{ fontSize: 18, color: accent }} /> : null}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="HH:mm"
          onBlur={() => commit(text)}
          disabled={disabled}
          sx={{
            backgroundColor: dark ? "#0b1d36" : "background.default",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: dark ? "#375a8f" : "divider" },
              "&:hover fieldset": { borderColor: dark ? "#0d4f8b" : "primary.main" },
              "&.Mui-focused fieldset": { borderColor: dark ? "#0d4f8b" : "primary.main" },
            },
          }}
          InputLabelProps={{ sx: { color: textColor } }}
          InputProps={{
            ...params.InputProps,
            sx: { color: textColor },
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    aria-label={`Abrir horários ${label}`}
                    disabled={disabled}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (disabled) return;
                      setOpen((current) => !current);
                    }}
                    edge="end"
                    size="small"
                  >
                    <ScheduleIcon sx={{ color: accent }} />
                  </IconButton>
                </InputAdornment>
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default function TimeRangeFilter({
  start,
  end,
  onChange,
  dark = false,
  disabled = false,
}: {
  start: string;
  end: string;
  onChange: (next: { start: string; end: string }) => void;
  dark?: boolean;
  disabled?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, width: "100%", minWidth: 280, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
      <TimeSelect label="De" value={start} onChange={(next) => onChange({ start: next, end })} dark={dark} disabled={disabled} />
      <TimeSelect label="Para" value={end} onChange={(next) => onChange({ start, end: next })} dark={dark} disabled={disabled} />
    </Box>
  );
}
