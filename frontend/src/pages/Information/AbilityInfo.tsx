import { DataGrid, GridColDef } from "@mui/x-data-grid";

import React from "react";
import { useGame } from "../../contexts/GameContext";

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
    flex: 1,
  },
];

const AbilityInfo: React.FC = () => {
  const { abilities } = useGame();
  return (
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
  );
};

export default AbilityInfo;
