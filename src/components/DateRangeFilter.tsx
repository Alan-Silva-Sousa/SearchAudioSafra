import { forwardRef, useEffect, useMemo, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import {
  format,
  isAfter,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "react-datepicker/dist/react-datepicker.css";
import "./DateRangeFilter.css";

registerLocale("pt-BR", ptBR);

function startOfDay(value: Date) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseIsoDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatRangeText(start: Date | null, end: Date | null) {
  if (start && end) return `${format(start, "dd/MM/yyyy")} – ${format(end, "dd/MM/yyyy")}`;
  if (start) return format(start, "dd/MM/yyyy");
  return "";
}

function maskDateRange(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  const formatPart = (part: string) => {
    const dd = part.slice(0, 2);
    const mm = part.slice(2, 4);
    const yyyy = part.slice(4, 8);
    let out = dd;
    if (mm) out += `/${mm}`;
    if (yyyy) out += `/${yyyy}`;
    return out;
  };
  const first = formatPart(digits.slice(0, 8));
  const second = formatPart(digits.slice(8, 16));
  if (!second) return first;
  return `${first} – ${second}`;
}

function parseTypedDate(digits: string): Date | null {
  if (digits.length !== 8) return null;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const date = new Date(year, month - 1, day);
  if (
    !isValid(date) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return startOfDay(date);
}

function clampRange(start: Date, end: Date, today: Date): { start: Date; end: Date } {
  let nextStart = start;
  let nextEnd = end;
  if (isAfter(nextStart, nextEnd)) {
    [nextStart, nextEnd] = [nextEnd, nextStart];
  }
  if (isAfter(nextStart, today)) nextStart = today;
  if (isAfter(nextEnd, today)) nextEnd = today;
  return { start: nextStart, end: nextEnd };
}

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  format(new Date(2020, month, 1), "MMM", { locale: ptBR }).replace(".", ""),
);

type DateRangeInputProps = {
  value?: string;
  onClick?: () => void;
  onChange?: () => void;
  text: string;
  onTextChange: (value: string) => void;
  onCommitText: () => void;
  dark?: boolean;
};

const DateRangeInput = forwardRef<HTMLInputElement, DateRangeInputProps>(
  function DateRangeInput(
    { text, onTextChange, onCommitText, onClick, dark },
    ref,
  ) {
    const fieldSx = dark
      ? {
          backgroundColor: "#0b1d36",
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "#375a8f" },
            "&:hover fieldset": { borderColor: "#0d4f8b" },
            "&.Mui-focused fieldset": { borderColor: "#0d4f8b" },
          },
        }
      : {
          backgroundColor: "background.default",
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "divider" },
            "&:hover fieldset": { borderColor: "primary.main" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          },
        };
    return (
      <TextField
        label="Período"
        value={text}
        onChange={(e) => onTextChange(maskDateRange(e.target.value))}
        onBlur={onCommitText}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommitText();
          }
        }}
        inputRef={ref}
        fullWidth
        placeholder="dd/MM/aaaa – dd/MM/aaaa"
        sx={fieldSx}
        InputLabelProps={{ shrink: true, sx: { color: dark ? "#e9eef5" : "text.primary" } }}
        InputProps={{
          sx: { color: dark ? "#e9eef5" : "text.primary" },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label="Abrir calendário"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  onClick?.();
                }}
                edge="end"
                size="small"
              >
                <CalendarMonthIcon sx={{ color: dark ? "#4ea3ff" : "primary.main" }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  },
);

export default function DateRangeFilter({
  start,
  end,
  onChange,
  dark = false,
}: {
  start: string;
  end: string;
  onChange: (next: { start: string; end: string }) => void;
  dark?: boolean;
}) {
  const [draft, setDraft] = useState<[Date | null, Date | null]>([
    parseIsoDate(start),
    parseIsoDate(end),
  ]);
  const [inputText, setInputText] = useState(() =>
    formatRangeText(parseIsoDate(start), parseIsoDate(end)),
  );
  const [navView, setNavView] = useState<"days" | "months" | "years">("days");
  const [yearPage, setYearPage] = useState(() => new Date().getFullYear() - 6);

  useEffect(() => {
    const nextStart = parseIsoDate(start);
    const nextEnd = parseIsoDate(end);
    setDraft([nextStart, nextEnd]);
    setInputText(formatRangeText(nextStart, nextEnd));
  }, [start, end]);

  const [startDate, endDate] = draft;
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxYear = today.getFullYear();

  const selectingEnd = Boolean(startDate && !endDate);
  const pickerMaxDate = today;
  const pickerMinDate = selectingEnd ? startDate ?? undefined : undefined;

  const committedStart = parseIsoDate(start);
  const committedEnd = parseIsoDate(end);

  const commitRange = (nextStart: Date, nextEnd: Date) => {
    const clamped = clampRange(nextStart, nextEnd, today);
    setDraft([clamped.start, clamped.end]);
    setInputText(formatRangeText(clamped.start, clamped.end));
    onChange({
      start: format(clamped.start, "yyyy-MM-dd"),
      end: format(clamped.end, "yyyy-MM-dd"),
    });
  };

  const handleCalendarChange = (update: [Date | null, Date | null]) => {
    const [nextStart, nextEnd] = update;
    setDraft([nextStart, nextEnd]);
    if (nextStart && nextEnd) {
      commitRange(nextStart, nextEnd);
      setNavView("days");
    } else {
      setInputText(formatRangeText(nextStart, nextEnd));
    }
  };

  const handleCommitText = () => {
    const digits = inputText.replace(/\D/g, "");
    if (!digits) {
      setDraft([null, null]);
      setInputText("");
      onChange({ start: "", end: "" });
      return;
    }
    if (digits.length < 16) {
      setInputText(formatRangeText(committedStart, committedEnd));
      return;
    }
    const typedStart = parseTypedDate(digits.slice(0, 8));
    const typedEnd = parseTypedDate(digits.slice(8, 16));
    if (!typedStart || !typedEnd) {
      setInputText(formatRangeText(committedStart, committedEnd));
      return;
    }
    commitRange(typedStart, typedEnd);
  };

  return (
    <div className={`date-range-filter${dark ? " date-range-filter--dark" : ""}`}>
      <DatePicker
        locale="pt-BR"
        selectsRange
        startDate={startDate}
        endDate={endDate}
        openToDate={endDate ?? startDate ?? today}
        onChange={handleCalendarChange}
        maxDate={pickerMaxDate}
        minDate={pickerMinDate}
        dateFormat="dd/MM/yyyy"
        shouldCloseOnSelect={false}
        onCalendarClose={() => setNavView("days")}
        customInput={
          <DateRangeInput
            text={inputText}
            onTextChange={setInputText}
            onCommitText={handleCommitText}
            dark={dark}
          />
        }
        calendarClassName={`date-range-calendar${navView !== "days" ? ` nav-${navView}` : ""}`}
        popperClassName="date-range-popper"
        showPopperArrow={false}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          decreaseYear,
          increaseYear,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
          changeMonth,
          changeYear,
        }) => {
          const viewDate = date;
          const viewYear = viewDate.getFullYear();
          const viewMonth = viewDate.getMonth();
          const years = Array.from({ length: 12 }, (_, i) => yearPage + i);

          const goPrev = () => {
            if (navView === "years") setYearPage((y) => Math.max(MIN_YEAR, y - 12));
            else if (navView === "months") decreaseYear();
            else decreaseMonth();
          };
          const goNext = () => {
            if (navView === "years") setYearPage((y) => Math.min(maxYear - 11, y + 12));
            else if (navView === "months") increaseYear();
            else increaseMonth();
          };

          return (
            <div className="date-range-header">
              <IconButton type="button" size="small" onClick={goPrev} disabled={navView === "days" ? prevMonthButtonDisabled : false}>
                <ChevronLeftIcon sx={{ color: dark ? "#4ea3ff" : "primary.main" }} />
              </IconButton>
              <div className="date-range-header-labels">
                {navView === "years" ? (
                  <span className="date-range-header-static">
                    {years[0]} – {years[years.length - 1]}
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      className="date-range-header-label"
                      onClick={() => setNavView("months")}
                    >
                      {format(viewDate, "MMMM", { locale: ptBR })}
                    </button>
                    <button
                      type="button"
                      className="date-range-header-label"
                      onClick={() => {
                        setYearPage(Math.min(Math.max(viewYear - 6, MIN_YEAR), maxYear - 11));
                        setNavView("years");
                      }}
                    >
                      {viewYear}
                    </button>
                  </>
                )}
              </div>
              <IconButton
                type="button"
                size="small"
                onClick={goNext}
                disabled={navView === "days" ? nextMonthButtonDisabled : false}
              >
                <ChevronRightIcon sx={{ color: dark ? "#4ea3ff" : "primary.main" }} />
              </IconButton>

              {navView === "months" && (
                <div className="date-range-nav-grid">
                  {MONTHS.map((label, month) => {
                    const disabled = viewYear === maxYear && month > today.getMonth();
                    return (
                      <button
                        key={label}
                        type="button"
                        className={`date-range-nav-item${month === viewMonth ? " is-selected" : ""}${disabled ? " is-disabled" : ""}`}
                        disabled={disabled}
                        onClick={() => {
                          changeMonth(month);
                          setNavView("days");
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {navView === "years" && (
                <div className="date-range-nav-grid">
                  {years.map((year) => {
                    const disabled = year < MIN_YEAR || year > maxYear;
                    return (
                      <button
                        key={year}
                        type="button"
                        className={`date-range-nav-item${year === viewYear ? " is-selected" : ""}${disabled ? " is-disabled" : ""}`}
                        disabled={disabled}
                        onClick={() => {
                          changeYear(year);
                          setNavView("months");
                        }}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }}
      />
</div>
  );
}
