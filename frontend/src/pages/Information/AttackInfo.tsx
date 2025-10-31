import "./style.css";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

import React from "react";
import { useGame } from "../../contexts/GameContext";

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "שם",
    width: 300,
    filterable: true,
  },
  {
    field: "tipo",
    headerName: "קטגוריה",
    align: "center",
    display: "flex",
    renderCell: (params) => {
      return (
        <div className={"type-icon type-" + params.value.toLowerCase()}>
          {params.value}
        </div>
      );
    },
  },
  {
    field: "type",
    headerName: "סוג",
    align: "center",
    display: "flex",
    renderCell: (params) => {
      return (
        <div className={"type-icon type-" + params.value.toLowerCase()}>
          {params.value}
        </div>
      );
    },
  },
  {
    field: "sterkte",
    headerName: "התקפה",
    align: "center",
    display: "flex",
  },
  {
    field: "mis",
    headerName: "דיוק",
    align: "center",
    display: "flex",
    valueGetter: (value) => 100 - value,
  },
  {
    field: "effect_kans",
    headerName: "אפקט",
    align: "center",
    display: "flex",
    renderCell(params) {
      const { value, row } = params;
      if (
        value === "0" ||
        value === "" ||
        (row.effect_naam !== "Sleep" &&
          row.effect_naam !== "Poisoned" &&
          row.effect_naam !== "Flinch" &&
          row.effect_naam !== "Burn" &&
          row.effect_naam !== "Freeze" &&
          row.effect_naam !== "Confued")
      ) {
        return " -- ";
      }
      return params.value + "% " + row.effect_naam;
    },
  },
  {
    field: "makes_contact",
    headerName: "מגע",
    align: "center",
    display: "flex",
    renderCell(params) {
      const { value } = params;
      if (value) {
        return (
          <img src={require('../../assets/images/icons/green.png')} alt="יש מגע" title="יש מגע" />
        );
      } else {
        return (
          <img src={require('../../assets/images/icons/red.png')} alt="אין מגע" title="אין מגע" />
        );
      }
    },
  },
  {
    field: "klaar",
    headerName: "סטטוס",
    align: "center",
    display: "flex",
    renderCell(params) {
      const { value } = params;
      if (value === "ja") {
        return (
          <img src={require('../../assets/images/icons/green.png')} alt="חל אפקט" title="חל אפקט" />
        );
      } else {
        return (
          <img
            src={require('../../assets/images/icons/red.png')}
            alt="לא חל אפקט"
            title="לא חל אפקט"
          />
        );
      }
    },
  },
];

const AttackInfo: React.FC = () => {
  const { attacks } = useGame();

  return (
    <div dir="rtl">
      <DataGrid
        rows={attacks}
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
  );
};

export default AttackInfo;
