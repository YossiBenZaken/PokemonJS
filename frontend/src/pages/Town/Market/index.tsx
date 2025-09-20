import { Link } from 'react-router-dom';
import React from 'react';
import styled from 'styled-components';

const MarketContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const WelcomeBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const ShopGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ShopCard = styled(Link)`
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-decoration: none;
  color: #333;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ShopIcon = styled.div`
  font-size: 48px;
  text-align: center;
  margin-bottom: 15px;
`;

const ShopTitle = styled.h3`
  text-align: center;
  margin-bottom: 10px;
  color: #4a90e2;
`;

const ShopDescription = styled.p`
  text-align: center;
  color: #666;
  line-height: 1.5;
`;

const MarketPage: React.FC = () => {
  const shops = [
    {
      title: 'פוקידורים',
      description: 'קנה פוקידורים שונים לתפיסת פוקימונים',
      icon: '🎾',
      path: '/market-shop?category=balls'
    },
    {
      title: 'פריטים',
      description: 'פריטים מיוחדים וחפצים שימושיים',
      icon: '🎒',
      path: '/market-shop?category=items'
    },
    {
      title: 'תרופות',
      description: 'תרופות לריפוי פוקימונים',
      icon: '💊',
      path: '/market-shop?category=potions'
    },
    {
      title: 'אבנים',
      description: 'אבני התפתחות לפוקימונים',
      icon: '💎',
      path: '/market-shop?category=stones'
    },
    {
      title: 'TM & HM',
      description: 'מכונות הוראה והתקפות',
      icon: '📀',
      path: '/market-shop?category=attacks'
    },
    {
      title: 'פריטים מיוחדים',
      description: 'פריטים נדירים ומיוחדים',
      icon: '✨',
      path: '/market-shop?category=specialitems'
    },
    {
      title: 'פוקימונים',
      description: 'קנה פוקימונים נדירים',
      icon: '🥚',
      path: '/market-shop?category=pokemon'
    }
  ];

  return (
    <MarketContainer>
      <WelcomeBox>
        <h1>🛒 פוקימארט</h1>
        <p>
          ברוכים הבאים לפוקימארט! כאן תוכלו למצוא את כל הפריטים הדרושים למסע הפוקימון שלכם.
          <br />
          בחרו מהקטגוריות השונות כדי לראות את הפריטים הזמינים.
        </p>
      </WelcomeBox>

      <ShopGrid>
        {shops.map((shop, index) => (
          <ShopCard key={index} to={shop.path}>
            <ShopIcon>{shop.icon}</ShopIcon>
            <ShopTitle>{shop.title}</ShopTitle>
            <ShopDescription>{shop.description}</ShopDescription>
          </ShopCard>
        ))}
      </ShopGrid>
    </MarketContainer>
  );
};

export default MarketPage;
