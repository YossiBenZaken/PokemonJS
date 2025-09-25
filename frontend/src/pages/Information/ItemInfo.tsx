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
    field: "naam",
    headerName: "שם",
    flex: 0.2,
    renderCell(params) {
      return (
        <p style={{
            display: 'inline-flex',
            alignItems: 'end'
        }}>
          <img
            src={`/images/items/${params.value}.png`}
            alt={params.value}
            title={params.value}
          /> {params.value}
        </p>
      );
    },
    display: "flex",
    filterable: true,
  },
  {
    field: "omschrijving_en",
    headerName: "תקציר",
    flex: 0.2
  },
  {
    field: "soort",
    headerName: "סוג",
    flex: 0.2,
    renderCell: (params) => {
        const typeItem = {
            'balls': 'פוקדורים',
            'items': 'חפצים',
            'potions': 'שיקויים',
            'stones': 'אבנים',
            'special items': 'חפצים מיוחדים'
        } as Record<string, string>;
        return typeItem[params.value as keyof typeof typeItem] ?? params.value;
    },
  },
  {
    field:'beschikbaar',
    headerName: 'קיים במרקט?',
    align: 'center',
    display: 'flex',
    renderCell(params) {
        const {value} = params;
        if(value) {
            return <img src="/images/icons/green.png" alt="יש מגע" title="יש מגע"/>;
        } else {
            return <img src="/images/icons/red.png" alt="אין מגע" title="אין מגע"/>;
        }
    },
  },
  {
    field:'roleta',
    headerName: 'גלגל מזל?',
    align: 'center',
    display: 'flex',
    renderCell(params) {
        const {value} = params;
        if(value === 'sim') {
            return <img src="/images/icons/green.png" alt="חל אפקט" title="חל אפקט"/>;
        } else {
            return <img src="/images/icons/red.png" alt="לא חל אפקט" title="לא חל אפקט"/>;
        }
    },
  },
  {
    field:'equip',
    headerName: 'ניתן להצמיד לפוקימון?',
    align: 'center',
    display: 'flex',
    renderCell(params) {
        const {value} = params;
        if(value) {
            return <img src="/images/icons/green.png" alt="חל אפקט" title="חל אפקט"/>;
        } else {
            return <img src="/images/icons/red.png" alt="לא חל אפקט" title="לא חל אפקט"/>;
        }
    },
  }
];

const ItemInfoPage: React.FC = () => {
  const { itemInfo } = useGame();
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
            rows={itemInfo}
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

export default ItemInfoPage;
