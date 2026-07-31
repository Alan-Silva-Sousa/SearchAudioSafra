import React, { useEffect, useState, useCallback } from 'react'
import { Alert, Box, Container, Typography, CircularProgress, Paper, IconButton, Menu, MenuItem, Stack, Button } from '@mui/material'
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from '@mui/x-date-pickers'
import FilterBar, { type FilterItem } from '../components/RecordingFilterBar'
import RecordingTable from '../components/RecordingTable'
import useRecordings from '../hooks/useRecordings'
import { useNavigate } from 'react-router-dom';
import MenuIcon from "@mui/icons-material/Menu";

export default function RecordingListPage() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { data: recordings, fetchRecordings, loading } = useRecordings()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [showDateRangeAlert, setShowDateRangeAlert] = useState(false)

  const navigate = useNavigate();
  const allowedUsers = ["admin@admin.com"];

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');

    navigate('/login');
    return true;
  }

  function goUpdatePassword() {
    navigate('/updatepassword');
    return true;
  }

  function goHome() {
    navigate('/');
    return true;
  }

  function goAdminPassword() {
    navigate('/adminpassword');
    return true;
  }

  function goRegister() {
    navigate('/register');
    return true;
  }

  function goUsersList() {
    navigate('/users');
    return true;
  }

  function goLogs() {
    navigate('/logs');
    return true;
  }


  function getEmail() {
    const email = localStorage.getItem('email');
    if (!email) {
      return false
    }
    return email
  }

  useEffect(() => {
    const email = getEmail();
    console.log(email)
    if (email) {
      setEmail(email)
    }
  }, [])

  const handleFilterChange = useCallback((filters: FilterItem[]) => {
    const hasDateWithOnlyStart = filters.some(
      filter => {
        const result = filter.field === 'date' && (!filter.end || filter.end == undefined);
        return result;
      }
    );

    setShowDateRangeAlert(hasDateWithOnlyStart);
  }, [])

  const handleFilterSubmit = (filters: FilterItem[]) => {
    setSelectedIds([]);
    fetchRecordings(filters);
  };
  
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container 
      maxWidth={false}   
      sx={{
          maxWidth: "90%",
        }}>
        <Container sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
          align: "center",
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 3,
          boxShadow: 1,
        }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.main"
          >
            SearchAudio4me

          </Typography>

          <Button
            type="button"
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700 }}
          >
          SearchVideo4ME
          </Button>

          {/* MENU HAMBURGER - REMOVIDO */}
          {/* <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              aria-controls={open ? "menu-actions" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              sx={{ backgroundColor: 'background.paper', color: 'primary.main', '&:hover': { backgroundColor: 'background.default' } }}

            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-actions"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{ sx: { color: 'text.primary' } }}
            >

            </Menu>
          </Container> */}

        </Container>
        {/* <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
          <Stack spacing={1}>
            <Alert
              severity="warning"
              sx={{
                px: 3,
                bgcolor: '#FFF3CD',
                color: '#856404',
                border: '1px solid #FFEEBA',
                textAlign: 'center',
              }}
            >
              Caso não seja utilizado o filtro de data, o mês selecionado será o atual
            </Alert>
            <Alert
              severity="warning"
              sx={{
                px: 3,
                bgcolor: '#FFF3CD',
                color: '#856404',
                border: '1px solid #FFEEBA',
                textAlign: 'center',
              }}
            >
              A consulta retorna no máximo 500 áudios
            </Alert>
            {showDateRangeAlert && (
              <Alert
                severity="info"
                sx={{
                  px: 3,
                  bgcolor: '#D1ECF1',
                  color: '#0C5460',
                  border: '1px solid #BEE5EB',
                  textAlign: 'center',
                }}
              >
                Caso seja informado apenas o campo "Data De", sem preencher "Data Até", serão consideradas todas as ligações até o último dia do mês correspondente à data selecionada.
              </Alert>
            )}
          </Stack>
        </Box> */}


        <Box  margin="0 0 0 0" sx={{ mb: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <FilterBar onSubmit={handleFilterSubmit} onFilterChange={handleFilterChange} />
          </LocalizationProvider>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : recordings?.length > 0 ? (
          <RecordingTable
            recordings={recordings}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        ) : (
          <Paper sx={{ mx: 'auto', width: '100%', p: 4, justifyContent:'center', textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
              Nenhum registro encontrado
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ajuste os filtros ou verifique os critérios de busca.
            </Typography>
          </Paper>
        )}

      </Container>

      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          display: { xs: 'none', sm: 'block' },
          pointerEvents: 'none'
        }}
      >
        <img
          src="/banco-safra-logo.png"
          alt="banco-safra-logo"
          style={{
            height: 120,
            opacity: 0.9,
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.14))',
            userSelect: 'none'
          }}
          draggable={false}
        />
      </Box>
    </Box>
  )
}