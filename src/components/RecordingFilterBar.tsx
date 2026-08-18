import { Box, Grid, TextField, MenuItem, Button, IconButton, Stack, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { RECORDING_FILTERS, recordingFilterLabel } from "../filters/recordingFilters";
import DateRangeFilter, { defaultDateRange } from "./DateRangeFilter";
import TimeRangeFilter from "./TimeRangeFilter";

export type FilterItem = {
  field: string;
  value: string;
  start?: string;
  end?: string;
};

export default function FilterBar({
  onSubmit,
  onFilterChange,
  dark = false,
}: {
  onSubmit: (filters: FilterItem[]) => void;
  onFilterChange?: (filters: FilterItem[]) => void;
  dark?: boolean;
}) {
  const { control, handleSubmit, setValue, watch, reset } = useForm<{ filters: FilterItem[] }>({
    defaultValues: {
      filters: [{ field: "", value: "" }],
    },
  });

  const initialRange = defaultDateRange();
  const [dateStart, setDateStart] = useState(initialRange.start);
  const [dateEnd, setDateEnd] = useState(initialRange.end);
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const filters = watch("filters");

  const buildFilters = (extra: FilterItem[] = filters): FilterItem[] => {
    const next: FilterItem[] = [
      { field: "RecordStart", value: "", start: dateStart, end: dateEnd },
    ];
    if (timeStart || timeEnd) {
      next.push({
        field: "RecordStartHour",
        value: "",
        start: timeStart || "00:00",
        end: timeEnd || "23:59",
      });
    }
    next.push(...extra.filter((item) => item.field && item.field !== "RecordStart" && item.field !== "RecordStartHour"));
    return next;
  };

  useEffect(() => {
    onFilterChange?.(filters);
  }, [JSON.stringify(filters), onFilterChange]);

  useEffect(() => {
    onSubmit(buildFilters([{ field: "", value: "" }]));
    // busca inicial com os últimos 15 dias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFilter = () => {
    setValue("filters", [...filters, { field: "", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setValue(
      "filters",
      filters.filter((_, i) => i !== index)
    );
  };

  const handleClearAll = () => {
    const range = defaultDateRange();
    setDateStart(range.start);
    setDateEnd(range.end);
    setTimeStart("");
    setTimeEnd("");
    reset({ filters: [{ field: "", value: "" }] });
    onSubmit([{ field: "RecordStart", value: "", start: range.start, end: range.end }]);
  };

  const handleFilter = (data: { filters: FilterItem[] }) => {
    onSubmit(buildFilters(data.filters));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFilter)}
      sx={{
        background: 'background.paper',
        p: 4,
        borderRadius: dark ? 1 : 3,
        width: "100%",
        boxSizing: "border-box",
        boxShadow: dark ? 0 : 1,
      }}
    >
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: dark ? "#e9eef5" : "text.primary" }}>
            Data/Hora Ligação
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
            <Box sx={{ flex: "1 1 320px", minWidth: 280 }}>
              <DateRangeFilter
                dark={dark}
                start={dateStart}
                end={dateEnd}
                onChange={({ start, end }) => {
                  setDateStart(start);
                  setDateEnd(end);
                }}
              />
            </Box>
            <Box sx={{ flex: "1 1 280px", minWidth: 260 }}>
              <TimeRangeFilter
                dark={dark}
                start={timeStart}
                end={timeEnd}
                onChange={({ start, end }) => {
                  setTimeStart(start);
                  setTimeEnd(end);
                }}
              />
            </Box>
          </Box>
        </Grid>

        {filters.map((_, index) => (
          <Grid
            key={index}
            container
            spacing={2}
            alignItems="center"
            wrap="wrap"
          >
            <Grid item xs={12} sm="auto" sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>
              <Controller
                name={`filters.${index}.field`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Filtro"
                    fullWidth
                    color="primary"
                    sx={{
                      backgroundColor: dark ? '#0b1d36' : 'background.default',
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: dark ? '#375a8f' : 'divider' },
                        "&:hover fieldset": { borderColor: dark ? '#0d4f8b' : 'primary.main' },
                        "&.Mui-focused fieldset": { borderColor: dark ? '#0d4f8b' : 'primary.main' },
                      },
                    }}
                    InputProps={{ sx: { color: dark ? '#e9eef5' : 'text.primary' } }}
                    InputLabelProps={{ sx: { color: dark ? '#e9eef5' : 'text.primary' } }}
                    SelectProps={{
                      renderValue: (selected) => recordingFilterLabel(String(selected)),
                      MenuProps: {
                        PaperProps: {
                          sx: dark
                            ? {
                                bgcolor: '#0d3a70',
                                color: '#e9eef5',
                                "& .MuiMenuItem-root": {
                                  color: '#e9eef5',
                                  "&.Mui-selected": { bgcolor: '#0d4f8b', color: '#fff' },
                                  "&.Mui-focusVisible": { bgcolor: '#0d4f8b' },
                                  "&:hover": { bgcolor: '#0d4f8b' },
                                },
                              }
                            : {
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                "& .MuiMenuItem-root": {
                                  color: 'primary.contrastText',
                                  "&.Mui-selected": { bgcolor: 'primary.dark', color: 'primary.contrastText' },
                                  "&.Mui-focusVisible": { bgcolor: 'primary.dark' },
                                  "&:hover": { bgcolor: 'primary.dark' },
                                },
                              },
                        },
                      },
                    }}
                  >
                    {RECORDING_FILTERS.map((option) => (
                      <MenuItem key={option.field} value={option.field}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sx={{ flexGrow: 1, width: '100%' }}>
              <Controller
                name={`filters.${index}.value`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={recordingFilterLabel(filters[index].field) || "Valor"}
                    fullWidth
                    sx={{
                      backgroundColor: dark ? '#0b1d36' : 'background.default',
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: dark ? '#375a8f' : 'divider' },
                        "&:hover fieldset": { borderColor: dark ? '#0d4f8b' : 'primary.main' },
                        "&.Mui-focused fieldset": { borderColor: dark ? '#0d4f8b' : 'primary.main' },
                      },
                    }}
                    InputProps={{ sx: { color: dark ? '#e9eef5' : 'text.primary' } }}
                    InputLabelProps={{ sx: { color: dark ? '#e9eef5' : 'text.primary' } }}
                  />
                )}
              />
            </Grid>

            {filters.length > 1 && (
              <Grid item xs={12} sm="auto" sx={{ minWidth: 50, pl: 0, width: { xs: '100%', sm: 'auto' } }}>
                <IconButton
                  color="secondary"
                  aria-label="Remover filtro"
                  onClick={() => removeFilter(index)}
                  sx={{
                    bgcolor: dark ? '#122a48' : 'background.default',
                    mt: { xs: 1, sm: 0 },
                    ml: { xs: 0, sm: 1 },
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': { bgcolor: dark ? '#184176' : 'background.paper' },
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Grid>
            )}
          </Grid>
        ))}

        <Grid container spacing={2} sx={{ mt: 1 }} alignItems="center" justifyContent="space-between" wrap="wrap">
          <Grid item xs={12} md="auto">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button type="button" variant="outlined" color={dark ? "secondary" : "primary"} startIcon={<AddIcon />} onClick={addFilter} sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
                Adicionar filtro
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
                Filtrar
              </Button>
              <Button type="button" variant="outlined" color="secondary" onClick={handleClearAll} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Limpar todos
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
