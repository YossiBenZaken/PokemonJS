import { DataGrid, GridColDef } from "@mui/x-data-grid";

import React from "react";
import { useGame } from "../../contexts/GameContext";

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
            src={require(`../../assets/images/items/${params.value}.png`)}
            alt={params.value}
            title={params.value}
            height={24}
            width={24}
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
            return <img src={require('../../assets/images/icons/green.png')} alt="יש מגע" title="יש מגע"/>;
        } else {
            return <img src={require('../../assets/images/icons/red.png')} alt="אין מגע" title="אין מגע"/>;
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
            return <img src={require('../../assets/images/icons/green.png')} alt="חל אפקט" title="חל אפקט"/>;
        } else {
            return <img src={require('../../assets/images/icons/red.png')} alt="לא חל אפקט" title="לא חל אפקט"/>;
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
            return <img src={require('../../assets/images/icons/green.png')} alt="חל אפקט" title="חל אפקט"/>;
        } else {
            return <img src={require('../../assets/images/icons/red.png')} alt="לא חל אפקט" title="לא חל אפקט"/>;
        }
    },
  }
];

const ItemInfoPage: React.FC = () => {
  const { itemInfo } = useGame();
  return (
        <div dir="rtl">
          <DataGrid
            rows={itemInfo}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  page: 0,
                  pageSize: 100,
                },
              },
            }}
            pageSizeOptions={[5, 10, 15, 20, 25,50,100]}
            sx={{ border: 0 }}
          />
        </div>
  );
};

export default ItemInfoPage;
