import { Box, Grid, TextField, MenuItem, Button, IconButton, Stack } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";

const menuLabelMap = {
  date: "Data/Hora Ligação",
  telefoneCliente: "Telefone Cliente",
  telefoneDestino: "Telefone Destino",
  documento: "Documento",
  filaSkill: "Fila/Skill",
  ambiente: "Ambiente",
  duracao: "Duração",
  format: "Formato",
  tamanho: "Tamanho",
};

function participantFieldLabel(name: string): string {
  if (name === 'skill') return 'skill/fila';
  return name;
}

function filterLabel(field: string): string {
  if (field.startsWith('participant:')) {
    return participantFieldLabel(field.slice('participant:'.length));
  }
  return menuLabelMap[field as keyof typeof menuLabelMap] || 'Selecione';
}

export type FilterItem = {
  field: string;
  value: string;
  start?: string;
  end?: string;
};

export default function FilterBar({
  onSubmit,
  onFilterChange,
  participantFields,
}: {
  onSubmit: (filters: FilterItem[]) => void;
  onFilterChange?: (filters: FilterItem[]) => void;
  participantFields: string[];
}) {
  const { control, handleSubmit, setValue, watch, reset } = useForm<{ filters: FilterItem[] }>({
    defaultValues: {
      filters: [{ field: "", value: "" }],
    },
  });

  const filters = watch("filters");

  const parseDate = (value?: string) =>
    value ? parse(value, "yyyy-MM-dd", new Date()) : null;

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
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
            {/* Campo de seleção */}
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
                        "& fieldset": {
                          borderColor: 'divider',
                        },
                        "&:hover fieldset": {
                          borderColor: 'primary.main',
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                    InputProps={{ sx: { color: 'text.primary' } }}
                    InputLabelProps={{ sx: { color: 'text.primary' } }}
                    SelectProps={{
                      renderValue: (selected) =>
                        filterLabel(String(selected)),
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
                    <MenuItem value="date">Data/Hora Ligação</MenuItem>
                    {participantFields.map((name) => (
                      <MenuItem key={name} value={`participant:${name}`}>
                        {participantFieldLabel(name)}
                      </MenuItem>
                    ))}
                    <MenuItem value="duracao">Duração</MenuItem>
                    <MenuItem value="format">Formato</MenuItem>
                    <MenuItem value="tamanho">Tamanho</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Campo valor */}
            <Grid item xs={12} sx={{ flexGrow: 1, width: '100%' }}>
              {filters[index].field === "date" ? (
                <>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                      <Controller
                        name={`filters.${index}.start`}
                        control={control}
                        render={({ field }) => (
                          <DesktopDatePicker
                            label="Data"
                            format="yyyy-MM-dd"
                            openTo="day"
                            value={parseDate(field.value)}
                            onChange={(v) => {
                              field.onChange(v ? v.toISOString().slice(0, 10) : "");
                            }}
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
                  </Box>
                </>
              ) : (
                <Controller
                  name={`filters.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={filterLabel(filters[index].field) || "Valor"}
                      fullWidth
                      sx={{
                        backgroundColor: 'background.default',
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: 'divider',
                          },
                          "&:hover fieldset": {
                            borderColor: 'primary.main',
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                      InputProps={{ sx: { color: 'text.primary' } }}
                      InputLabelProps={{ sx: { color: 'text.primary' } }}
                    />
                  )}
                />
              )}
            </Grid>

            {/* Botão remover */}
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
                    '& .MuiButtonBase-root': { width: '100%' },
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Grid>
            )}
          </Grid>
        ))}

        {/* Botões de ação + Botão de Configuração */}
        <Grid
          container
          spacing={2}
          sx={{ mt: 1 }}
          alignItems="center"
          justifyContent="space-between"
          wrap="wrap"
        >
          <Grid item xs={12} md="auto">
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                type="button"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addFilter}
                sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
              >
                Adicionar filtro
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}
              >
                Filtrar
              </Button>

              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleClearAll}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Limpar todos
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
