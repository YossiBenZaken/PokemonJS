import React, { useState } from "react";

import AbilityInfo from "./AbilityInfo";
import AttackInfo from "./AttackInfo";
import Box from "@mui/material/Box";
import ItemInfo from "./ItemInfo";
import MoodInfo from "./MoodInfo";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import styled from "styled-components";

const Container = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const InformationPage: React.FC = () => {
  const [value, setValue] = useState<number>(0);
  return (
    <Container>
      <Header>
        <Title>מידע</Title>
      </Header>

      <Box sx={{ width: "100%", typography: "body1",background: 'white' }}>
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              
            }}
          >
            <TabList onChange={(_, value) => setValue(value)}>
              <Tab label="מידע על התקפות" {...a11yProps(0)} />
              <Tab label="מידע על מצבים" {...a11yProps(1)} />
              <Tab label="מידע על יכולות" {...a11yProps(2)} />
              <Tab label="מידע על חפצים" {...a11yProps(3)} />
            </TabList>
          </Box>
          <TabPanel value={0}><AttackInfo /></TabPanel>
          <TabPanel value={1}><MoodInfo /></TabPanel>
          <TabPanel value={2}><AbilityInfo /></TabPanel>
          <TabPanel value={3}><ItemInfo /></TabPanel>
        </TabContext>
      </Box>
    </Container>
  );
};

export default InformationPage;
