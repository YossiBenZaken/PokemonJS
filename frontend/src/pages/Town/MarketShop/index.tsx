import { MARKET_CATEGORIES, MarketItem, UserInventory } from '../../../models/market.model';
import React, { useCallback, useEffect, useState } from 'react';

import Loader from '../../../components/Loader';
import MarketItemCard from './MarketItemCard';
import { marketApi } from '../../../api/market.api';
import styled from 'styled-components';
import { useGame } from '../../../contexts/GameContext';
import { useSearchParams } from 'react-router-dom';

const MarketShopContainer = styled.div`
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

const InventoryInfo = styled.div`
  background: #4a90e2;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const CurrencyDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
`;

const CurrencyIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const CategoryButton = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  background: ${props => props.active ? '#4a90e2' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.active ? '#357abd' : '#e0e0e0'};
    transform: translateY(-2px);
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background: #ff6b6b;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #51cf66;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const NoItemsMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
  background: #f8f9fa;
  border-radius: 10px;
  grid-column: 1 / -1;
`;

const MarketShopPage: React.FC = () => {
  const {selectedCharacter} = useGame();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentCategory = searchParams.get('category') || 'balls';

  const loadData = useCallback(async () => {
    try {
      if(selectedCharacter) {
        setLoading(true);
        setError(null);
        
        const [itemsData, inventoryData] = await Promise.all([
          marketApi.getMarketItems(currentCategory),
          marketApi.getUserInventory(selectedCharacter?.user_id.toString()!)
        ]);
        setItems(itemsData);
        setInventory(inventoryData);
      }
    } catch (err) {
      setError('שגיאה בטעינת הנתונים');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, selectedCharacter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryChange = (category: string) => {
    setSearchParams({ category });
  };

  const handleBuyItem = async (itemId: number, amount: number) => {
    try {
      const result = await marketApi.buyItem({ itemId, amount, userId: selectedCharacter?.user_id! });
      if (result.success) {
        setSuccess(result.message);
        loadData(); // רענון הנתונים
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('שגיאה בקניית הפריט');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBuyPokemon = async (productId: number) => {
    try {
      const result = await marketApi.buyPokemon({ productId, userId: selectedCharacter?.user_id! });
      if (result.success) {
        setSuccess(result.message);
        loadData(); // רענון הנתונים
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('שגיאה בקניית הפוקימון');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <MarketShopContainer>
      <WelcomeBox>
        <h1>🛒 פוקימארט</h1>
        <p>
          שלום, מאמן! איך אני יכול לעזור לך? אני מנחש... נגמרו לך הפוקידורים?
          <br />
          אם כן, אתה במקום הנכון! תראה את המלאי היפה שלנו של פוקידורים...
          <br />
          אחרת יש לנו הרבה פריטים ופוקימונים אחרים שיעזרו לך במסע שלך!
        </p>
      </WelcomeBox>

      {inventory && (
        <InventoryInfo>
          <CurrencyDisplay>
            <CurrencyIcon src={require('../../../assets/images/icons/silver.png')} alt="Silver" />
            <span>{inventory.silver.toLocaleString()}</span>
          </CurrencyDisplay>
          <CurrencyDisplay>
            <CurrencyIcon src={require('../../../assets/images/icons/gold.png')}alt="Gold" />
            <span>{inventory.gold.toLocaleString()}</span>
          </CurrencyDisplay>
          <div>
            <strong>מקום פנוי:</strong> {inventory.item_over}
          </div>
          <div>
            <strong>תיק:</strong> {inventory.itembox}
          </div>
        </InventoryInfo>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <CategoryTabs>
        {MARKET_CATEGORIES.map((category) => (
          <CategoryButton
            key={category.key}
            active={currentCategory === category.path}
            onClick={() => handleCategoryChange(category.path)}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </CategoryButton>
        ))}
      </CategoryTabs>

      {items.length === 0 ? (
        <NoItemsMessage>
          אין פריטים זמינים בקטגוריה זו
        </NoItemsMessage>
      ) : (
        <ItemsGrid>
          {items.map((item) => (
            <MarketItemCard
              key={item.id}
              item={item}
              onBuyItem={handleBuyItem}
              onBuyPokemon={handleBuyPokemon}
              inventory={inventory}
            />
          ))}
        </ItemsGrid>
      )}
    </MarketShopContainer>
  );
};

export default MarketShopPage;
