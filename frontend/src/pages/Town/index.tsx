import React, { useState } from 'react';

import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const TownContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const InfoBox = styled.div`
  background: #4a90e2;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
`;

const MapContainer = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const TownImage = styled.img`
  width: 610px;
  height: 610px;
  display: block;
`;

const BuildingArea = styled.a<{ 
  x: number; 
  y: number; 
  width: number; 
  height: number;
  isHovered: boolean;
}>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-radius: 4px;
  
  &:hover {
    border-color: #4a90e2;
    background-color: rgba(74, 144, 226, 0.1);
    transform: scale(1.02);
  }
  
  ${props => props.isHovered && `
    border-color: #4a90e2;
    background-color: rgba(74, 144, 226, 0.1);
    transform: scale(1.02);
  `}
`;

const Tooltip = styled.div<{ x: number; y: number; visible: boolean }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'translateY(-5px)' : 'translateY(0)'};
  transition: all 0.3s ease;
  max-width: 200px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

interface Building {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
}

const buildings: Building[] = [
  {
    id: 'a',
    name: 'גימנסיה',
    description: 'התמודד עם מנהיגי הגימנסיה כדי לקבל תגים ולפתוח אזורים חדשים!',
    x: 37,
    y: 30,
    width: 98,
    height: 117,
    path: '/gyms'
  },
  {
    id: 'b',
    name: 'מומחים',
    description: 'שנה את השם, מצב הרוח של הפוקימונים שלך, ותוכל להפוך אותם לשיני עם המומחים שלנו!',
    x: 164,
    y: 90,
    width: 44,
    height: 95,
    path: '/specialists'
  },
  {
    id: 'c',
    name: 'נסיעות',
    description: 'איך זה לקחת את התיקים ולנסוע להכיר מאמנים ופוקימונים חדשים באזורים אחרים?',
    x: 259,
    y: 10,
    width: 94,
    height: 140,
    path: '/travel'
  },
  {
    id: 'd',
    name: 'בנק',
    description: 'עשה העברות של כסף או זהב עם מאמנים אחרים.',
    x: 447,
    y: 96,
    width: 53,
    height: 91,
    path: '/bank'
  },
  {
    id: 'e',
    name: 'מעון יום',
    description: 'שים את הפוקימון שלך כאן בגן הילדים כדי לעלות רמות ויש סיכוי לקבל ביצה!',
    x: 30,
    y: 416,
    width: 51,
    height: 78,
    path: '/daycare'
  },
  {
    id: 'f',
    name: 'שוק פוקימונים',
    description: 'קנה ומכור פוקימונים במחיר הטוב ביותר עם שיטות המכירה שלנו כאן בשוק הפוקימונים',
    x: 92,
    y: 222,
    width: 103,
    height: 184,
    path: '/transferlist'
  },
  {
    id: 'g',
    name: 'פוקימארט',
    description: 'פוקידורים, פריטים, אבנים, פוקימונים ופריטים אחרים תמצא כאן בפוקימארט!',
    x: 445,
    y: 242,
    width: 45,
    height: 47,
    path: '/market'
  },
  {
    id: 'h',
    name: 'קזינו',
    description: 'המר כרטיסים, שחק מיניגיימים וזכה בפרסים!',
    x: 281,
    y: 308,
    width: 93,
    height: 75,
    path: '/casino'
  },
  {
    id: 'i',
    name: 'מרכז פוקימון',
    description: 'הפוקימונים שלך עייפים? אתה במקום הנכון, האחות ג\'וי תעזור לך כאן במרכז הפוקימון.',
    x: 446,
    y: 326,
    width: 54,
    height: 57,
    path: '/pokemoncenter'
  },
  {
    id: 'j',
    name: 'סוחרים',
    description: 'החלף את הפוקימון שלך באחר עם הסוחרים כאן!',
    x: 313,
    y: 418,
    width: 49,
    height: 80,
    path: '/traders'
  },
  {
    id: 'k',
    name: 'התקפות',
    description: 'למד או הזכר התקפות של הפוקימונים שלך כאן!',
    x: 479,
    y: 454,
    width: 40,
    height: 91,
    path: '/moves'
  },
  {
    id: 'l',
    name: 'מזרקת הנעורים',
    description: 'תן לפוקימונים שלך לעבור דרך מזרקת הנעורים כדי להצעיר אותם!',
    x: 310,
    y: 238,
    width: 45,
    height: 47,
    path: '/fountain'
  }
];

const TownPage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleBuildingClick = (path: string) => {
    navigate(path);
  };

  const handleBuildingHover = (buildingId: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    setHoveredBuilding(buildingId);
    const target = event.currentTarget as HTMLAnchorElement;
    setTooltipPosition({
      x: target.offsetLeft + target.offsetWidth / 2,
      y: target.offsetTop - 10
    });
  };

  const handleBuildingLeave = () => {
    setHoveredBuilding(null);
  };

  return (
    <TownContainer>
      <InfoBox>
        🏘️ העבר את העכבר מעל הבניינים כדי ללמוד על המקום.
      </InfoBox>

      <MapContainer>
        <TownImage 
          src={require('../../assets/images/town/town.png')}
          alt="מפת העיר"
        />
        
        {buildings.map((building) => (
          <BuildingArea
            key={building.id}
            x={building.x}
            y={building.y}
            width={building.width}
            height={building.height}
            isHovered={hoveredBuilding === building.id}
            onClick={() => handleBuildingClick(building.path)}
            onMouseEnter={(e) => handleBuildingHover(building.id, e)}
            onMouseLeave={handleBuildingLeave}
            title={building.description}
          />
        ))}

        {hoveredBuilding && (
          <Tooltip
            x={tooltipPosition.x}
            y={tooltipPosition.y}
            visible={!!hoveredBuilding}
          >
            {buildings.find(b => b.id === hoveredBuilding)?.description}
          </Tooltip>
        )}
      </MapContainer>
    </TownContainer>
  );
};

export default TownPage;
