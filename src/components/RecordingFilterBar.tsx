import { Box, Grid, TextField, MenuItem, Button, IconButton, Stack } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";
import { isRecordingDateFilter, RECORDING_FILTERS, recordingFilterLabel } from "../filters/recordingFilters";
import { BR_DATE_FORMAT, parseStoredDate, toApiDate } from "../utils/dateInput";

export type FilterItem = {
  field: string;
  value: string;
  start?: string;
  end?: string;
};

export default function FilterBar({
  onSubmit,
  onFilterChange,
}: {
  onSubmit: (filters: FilterItem[]) => void;
  onFilterChange?: (filters: FilterItem[]) => void;
}) {
  const { control, handleSubmit, setValue, watch, reset } = useForm<{ filters: FilterItem[] }>({
    defaultValues: {
      filters: [{ field: "", value: "" }],
    },
  });

  const filters = watch("filters");

  useEffect(() => {
    onFilterChange?.(filters);
  }, [JSON.stringify(filters), onFilterChange]);

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
    reset({ filters: [{ field: "", value: "" }] });
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
        borderRadius: 3,
        width: "100%",
        boxSizing: "border-box",
        boxShadow: 1,
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
                    sx={{
                      backgroundColor: 'background.default',
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: 'divider' },
                        "&:hover fieldset": { borderColor: 'primary.main' },
                        "&.Mui-focused fieldset": { borderColor: 'primary.main' },
                      },
                    }}
                    InputProps={{ sx: { color: 'text.primary' } }}
                    InputLabelProps={{ sx: { color: 'text.primary' } }}
                    SelectProps={{
                      renderValue: (selected) => recordingFilterLabel(String(selected)),
                      MenuProps: {
                        PaperProps: {
                          sx: {
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
              {isRecordingDateFilter(filters[index].field) ? (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <Controller
                    name={`filters.${index}.value`}
                    control={control}
                    render={({ field }) => (
                      <DesktopDatePicker
                        label={recordingFilterLabel(filters[index].field)}
                        format={BR_DATE_FORMAT}
                        openTo="day"
                        value={parseStoredDate(field.value)}
                        onChange={(value) => field.onChange(toApiDate(value))}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: { backgroundColor: 'background.default' },
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              ) : (
                <Controller
                  name={`filters.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={recordingFilterLabel(filters[index].field) || "Valor"}
                      fullWidth
                      sx={{
                        backgroundColor: 'background.default',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: 'divider' },
                          "&:hover fieldset": { borderColor: 'primary.main' },
                          "&.Mui-focused fieldset": { borderColor: 'primary.main' },
                        },
                      }}
                      InputProps={{ sx: { color: 'text.primary' } }}
                      InputLabelProps={{ sx: { color: 'text.primary' } }}
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
                    bgcolor: 'background.default',
                    mt: { xs: 1, sm: 0 },
                    ml: { xs: 0, sm: 1 },
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': { bgcolor: 'background.paper' },
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
              <Button type="button" variant="outlined" startIcon={<AddIcon />} onClick={addFilter} sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
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
