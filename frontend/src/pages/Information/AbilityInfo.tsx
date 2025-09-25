import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";

import { CacheProvider } from "@emotion/react";
import React from "react";
import createCache from "@emotion/cache";
import { heIL } from "@mui/x-data-grid/locales";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { useGame } from "../../contexts/GameContext";

const cacheRtl = createCache({
  key: "data-grid-rtl-attack-info",
  stylisPlugins: [prefixer, rtlPlugin],
});

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "שם",
    flex: 0.2,
    filterable: true,
  },
  {
    field: "descr",
    headerName: "תיאור",
    display: "flex",
    flex: 1
  },
];

const AbilityInfo: React.FC = () => {
  const { abilities } = useGame();
  const existingTheme = useTheme();
  const theme = React.useMemo(
    () =>
      createTheme({}, heIL, existingTheme, {
        direction: "rtl",
      }),
    [existingTheme]
  );
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <div dir="rtl">
          <DataGrid
            rows={abilities}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  page: 0,
                  pageSize: 20,
                },
              },
            }}
            pageSizeOptions={[5, 10, 15, 20, 25]}
            sx={{ border: 0 }}
          />
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AbilityInfo;
