import { Box, Grid, TextField, MenuItem, Button, IconButton, Stack, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { useEffect } from "react";
import { isRecordingDateRangeFilter, RECORDING_FILTERS, recordingFilterLabel } from "../filters/recordingFilters";
import DateRangeFilter from "./DateRangeFilter";
import TimeRangeFilter from "./TimeRangeFilter";

export type FilterItem = {
  field: string;
  value: string;
  start?: string;
  end?: string;
  hourStart?: string;
  hourEnd?: string;
};

function fieldSx(dark: boolean) {
  return {
    backgroundColor: dark ? '#0b1d36' : 'background.default',
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: dark ? '#375a8f' : 'divider' },
      "&:hover fieldset": { borderColor: dark ? '#0d4f8b' : 'primary.main' },
      "&.Mui-focused fieldset": { borderColor: dark ? '#0d4f8b' : 'primary.main' },
    },
  };
}

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
      filters: [{ field: "", value: "", start: "", end: "", hourStart: "", hourEnd: "" }],
    },
  });

  const filters = watch("filters");

  useEffect(() => {
    onFilterChange?.(filters);
  }, [JSON.stringify(filters), onFilterChange]);

  const addFilter = () => {
    setValue("filters", [...filters, { field: "", value: "", start: "", end: "", hourStart: "", hourEnd: "" }]);
  };

  const removeFilter = (index: number) => {
    setValue(
      "filters",
      filters.filter((_, i) => i !== index)
    );
  };

  const handleClearAll = () => {
    reset({ filters: [{ field: "", value: "", start: "", end: "", hourStart: "", hourEnd: "" }] });
  };

  const handleFilter = (data: { filters: FilterItem[] }) => {
    onSubmit(data.filters);
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
                    sx={fieldSx(dark)}
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
              {isRecordingDateRangeFilter(filters[index].field) ? (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <Box sx={{ flex: "1 1 280px", minWidth: 240 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700, color: dark ? "#e9eef5" : "text.primary" }}>
                      Data
                    </Typography>
                    <DateRangeFilter
                      dark={dark}
                      start={filters[index].start || ""}
                      end={filters[index].end || ""}
                      onChange={({ start, end }) => {
                        setValue(`filters.${index}.start`, start);
                        setValue(`filters.${index}.end`, end);
                        if (!start && !end) {
                          setValue(`filters.${index}.hourStart`, "");
                          setValue(`filters.${index}.hourEnd`, "");
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: "1 1 260px", minWidth: 240 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700, color: dark ? "#e9eef5" : "text.primary" }}>
                      Hora
                    </Typography>
                    <TimeRangeFilter
                      dark={dark}
                      disabled={!filters[index].start && !filters[index].end}
                      start={filters[index].hourStart || ""}
                      end={filters[index].hourEnd || ""}
                      onChange={({ start, end }) => {
                        setValue(`filters.${index}.hourStart`, start);
                        setValue(`filters.${index}.hourEnd`, end);
                      }}
                    />
                    {!filters[index].start && !filters[index].end && (
                      <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: dark ? "#9bb0c9" : "text.secondary" }}>
                        Preencha a data para filtrar por horário
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <Controller
                  name={`filters.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={recordingFilterLabel(filters[index].field) || "Valor"}
                      fullWidth
                      sx={fieldSx(dark)}
                      InputProps={{ sx: { color: dark ? '#e9eef5' : 'text.primary' } }}
                      InputLabelProps={{ sx: { color: dark ? '#e9eef5' : 'text.primary' } }}
                    />
                  )}
                />
              )}
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
