// frontend/src/pages/TransferList/index.tsx

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  TextField,
} from "@mui/material";
import {Container, FilterBox, FilterRow, Header, Title} from './styled';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FiltersData, TransferListItem, buyPokemon, deletePokemon, getFilteredData, getTransferList } from "../../../api/transferlist.api";
import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";

import { CacheProvider } from "@emotion/react";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import axios from "axios";
import createCache from "@emotion/cache";
import { heIL } from "@mui/x-data-grid/locales";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";

const cacheRtl = createCache({
  key: "data-grid-rtl-transferlist",
  stylisPlugins: [prefixer, rtlPlugin],
});


const TransferListPage: React.FC = () => {
  const [tabValue, setTabValue] = useState("direct");
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferList, setTransferList] = useState<TransferListItem[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [rowCount, setRowCount] = useState(0);

  const [filters, setFilters] = useState({
    specie: "",
    total: "",
    shiny: false,
    region: "All",
    price: "",
    price_type: "silver",
    trainer: "",
    level: "",
    level_type: "maior",
    equip: "",
  });

  const existingTheme = useTheme();
  const theme = React.useMemo(
    () => createTheme({}, heIL, existingTheme, { direction: "rtl" }),
    [existingTheme]
  );

  useEffect(() => {
    loadFiltersData();
  }, []);

  useEffect(() => {
    loadTransferList();
  }, [tabValue, showMineOnly, paginationModel]);

  const loadFiltersData = async () => {
    try {
      const response = await getFilteredData();
      setFiltersData(response);
    } catch (err) {
      console.error("Error loading filters:", err);
    }
  };

  const loadTransferList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        type: tabValue,
        mine: showMineOnly.toString(),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          params.append(key, value.toString());
        }
      });

      const response = await getTransferList(params);
      setTransferList(response);
    } catch (err: any) {
      setError(err.response?.data?.error || "שגיאה בטעינת הנתונים");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (transferId: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך לקנות פוקימון זה?")) return;

    try {
      const encodedId = btoa(transferId.toString());
      const response = await buyPokemon(encodedId);

      alert("הפוקימון נקנה בהצלחה!");
      window.location.href = `/pokemon-profile?id=${response.data.pokemonId}`;
    } catch (err: any) {
      alert(err.response?.data?.error || "שגיאה בקניית הפוקימון");
    }
  };

  const handleRemove = async (pokemonId: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך להסיר פוקימון זה?")) return;

    try {
      await deletePokemon(pokemonId);
      loadTransferList();
    } catch (err: any) {
      alert(err.response?.data?.error || "שגיאה בהסרת הפוקימון");
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setPaginationModel({ ...paginationModel, page: 0 });
    loadTransferList();
  };

  const columns: GridColDef[] = [
    {
      field: "naam",
      headerName: "פוקימון",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const row = params.row;
        const displayName = row.roepnaam || row.naam;
        const shinyIcon = row.shiny === 1 ? "⭐" : "";

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src={row.animatie || `/images/pokemon/icon/${row.wild_id}.gif`}
              alt={displayName}
              style={{ width: 32, height: 32 }}
            />
            <span>
              {displayName} {shinyIcon}
            </span>
          </Box>
        );
      },
    },
    {
      field: "characteristics",
      headerName: "מאפיינים",
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box>
            <div>
              <strong>רמה:</strong> {row.level}
            </div>
            <div>
              <strong>הומור:</strong> {row.karakter}
            </div>
            <div>
              <strong>יכולת:</strong> {row.ability}
            </div>
          </Box>
        );
      },
    },
    {
      field: "powertotal",
      headerName: "כוח כולל",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "item",
      headerName: "פריט",
      width: 120,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        if (!params.value) return "ללא";
        return (
          <img
            src={`/images/items/${params.value}.png`}
            alt={params.value}
            title={params.value}
            style={{ width: 24, height: 24 }}
          />
        );
      },
    },
    {
      field: "datum",
      headerName: "תאריך",
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "price",
      headerName: "מחיר / פעולה",
      width: 200,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        const row = params.row;
        const userId = localStorage.getItem("userId");

        if (row.user_id.toString() === userId) {
          return (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleRemove(row.id)}
              disabled={tabValue === "auction" && (row.lances || 0) > 0}
            >
              הסר
            </Button>
          );
        }

        return (
          <Box sx={{ textAlign: "center" }}>
            {row.silver > 0 && (
              <div style={{ marginBottom: 4 }}>
                {row.silver.toLocaleString()}{" "}
                <img
                  src="/images/icons/silver.png"
                  alt="Silver"
                  style={{ width: 16, height: 16, verticalAlign: "middle" }}
                />
              </div>
            )}
            {row.gold > 0 && (
              <div style={{ marginBottom: 4 }}>
                {row.gold.toLocaleString()}{" "}
                <img
                  src="/images/icons/gold.png"
                  alt="Gold"
                  style={{ width: 16, height: 16, verticalAlign: "middle" }}
                />
              </div>
            )}
            {row.negociavel && (
              <div style={{ color: "#d25757", fontSize: 11, marginBottom: 4 }}>
                NEGOCIÁVEL
              </div>
            )}
            {tabValue === "auction" && row.lances !== undefined && (
              <div style={{ color: "#d25757", fontSize: 11, marginBottom: 4 }}>
                {row.lances} LANCES
              </div>
            )}
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() =>
                tabValue === "auction"
                  ? (window.location.href = `/pokemon-profile?id=${row.id}`)
                  : handleBuy(row.tid)
              }
            >
              {tabValue === "auction" ? "DAR LANCE" : "קנה"}
            </Button>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            (window.location.href = `/pokemon-profile?id=${params.row.id}`)
          }
        >
          🔍
        </Button>
      ),
    },
  ];

  return (
    <Container>
      <Header>
        <Title>שוק פוקימונים</Title>
        <p>קנה ומכור פוקימונים במחירים הטובים ביותר</p>
      </Header>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FilterBox>
        <h3 style={{ marginTop: 0 }}>סינון מכירות</h3>

        <FilterRow>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>מין</InputLabel>
            <Select
              value={filters.specie}
              label="מין"
              onChange={(e) => handleFilterChange("specie", e.target.value)}
              sx={{ bgcolor: "white" }}
            >
              <MenuItem value="">הכל</MenuItem>
              {filtersData?.species.map((s) => (
                <MenuItem key={s.wild_id} value={s.wild_id}>
                  #{s.real_id} - {s.naam}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="כוח כולל (מינימום)"
            type="number"
            value={filters.total}
            onChange={(e) => handleFilterChange("total", e.target.value)}
            sx={{ bgcolor: "white", borderRadius: 1, width: 150 }}
            size="small"
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
              checked={filters.shiny}
              onChange={(e) => handleFilterChange("shiny", e.target.checked)}
              sx={{ color: "white" }}
            />
            <label>רק שיני</label>
          </Box>
        </FilterRow>

        <FilterRow>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>אזור</InputLabel>
            <Select
              value={filters.region}
              label="אזור"
              onChange={(e) => handleFilterChange("region", e.target.value)}
              sx={{ bgcolor: "white" }}
            >
              {filtersData?.regions.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="מחיר מקסימלי"
            type="number"
            value={filters.price}
            onChange={(e) => handleFilterChange("price", e.target.value)}
            sx={{ bgcolor: "white", borderRadius: 1, width: 120 }}
            size="small"
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>מטבע</InputLabel>
            <Select
              value={filters.price_type}
              label="מטבע"
              onChange={(e) => handleFilterChange("price_type", e.target.value)}
              sx={{ bgcolor: "white" }}
            >
              <MenuItem value="silver">Silver</MenuItem>
              <MenuItem value="golds">Gold</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="שם מאמן"
            value={filters.trainer}
            onChange={(e) => handleFilterChange("trainer", e.target.value)}
            sx={{ bgcolor: "white", borderRadius: 1, width: 150 }}
            size="small"
          />
        </FilterRow>

        <FilterRow>
          <TextField
            label="רמה"
            type="number"
            value={filters.level}
            onChange={(e) => handleFilterChange("level", e.target.value)}
            sx={{ bgcolor: "white", borderRadius: 1, width: 100 }}
            size="small"
            inputProps={{ min: 0, max: 100 }}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>סוג סינון</InputLabel>
            <Select
              value={filters.level_type}
              label="סוג סינון"
              onChange={(e) => handleFilterChange("level_type", e.target.value)}
              sx={{ bgcolor: "white" }}
            >
              <MenuItem value="maior">גדול מ-</MenuItem>
              <MenuItem value="menor">קטן מ-</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>פריט מצויד</InputLabel>
            <Select
              value={filters.equip}
              label="פריט מצויד"
              onChange={(e) => handleFilterChange("equip", e.target.value)}
              sx={{ bgcolor: "white" }}
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="none">ללא פריט</MenuItem>
              {filtersData?.items.map((item) => (
                <MenuItem key={item.naam} value={item.naam.replace(/ /g, "_")}>
                  {item.naam}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ height: 40 }}
          >
            חפש
          </Button>
        </FilterRow>
      </FilterBox>

      <Box sx={{ width: "100%", bgcolor: "white", borderRadius: 2 }}>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={(_, newValue) => setTabValue(newValue)} centered>
              <Tab label="מכירות ישירות" value="direct" />
              <Tab label="מכירות פרטיות" value="private" />
              <Tab label="מכרזים" value="auction" />
            </TabList>
          </Box>

          <TabPanel value={tabValue}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <Checkbox
                checked={showMineOnly}
                onChange={(e) => setShowMineOnly(e.target.checked)}
              />
              <label>הצג רק את הפוקימונים שלי</label>
            </Box>

            <CacheProvider value={cacheRtl}>
              <ThemeProvider theme={theme}>
                <div dir="rtl">
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        p: 4,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={transferList}
                      columns={columns}
                      paginationModel={paginationModel}
                      onPaginationModelChange={setPaginationModel}
                      pageSizeOptions={[5, 10, 15, 20, 25]}
                      rowCount={rowCount}
                      paginationMode="server"
                      loading={loading}
                      sx={{
                        border: 0,
                        minHeight: 400,
                        "& .MuiDataGrid-cell": {
                          borderBottom: "1px solid #e0e0e0",
                        },
                      }}
                      disableRowSelectionOnClick
                      getRowHeight={() => "auto"}
                    />
                  )}
                </div>
              </ThemeProvider>
            </CacheProvider>
          </TabPanel>
        </TabContext>
      </Box>
    </Container>
  );
};

export default TransferListPage;
