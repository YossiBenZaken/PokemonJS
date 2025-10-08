import { ITEM_CATEGORIES, ItemWithQuantity } from "../../models/item.model";
import React, { useCallback, useEffect, useState } from "react";

import ItemTable from "./ItemTable";
import Loader from "../../components/Loader";
import { itemsApi } from "../../api/items.api";
import styled from "styled-components";
import { useGame } from "../../contexts/GameContext";
import { useSearchParams } from "react-router-dom";

const ItemsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const NPCBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const BackpackInfo = styled.div`
  background: #4a90e2;
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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
  background: ${(props) => (props.active ? "#4a90e2" : "#f0f0f0")};
  color: ${(props) => (props.active ? "white" : "#333")};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: ${(props) => (props.active ? "#357abd" : "#e0e0e0")};
    transform: translateY(-2px);
  }
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

export const ItemBox = {
  Bag: 20,
  "Yellow box": 50,
  "Blue box": 100,
  "Red box": 250,
  "Purple box": 500,
  "Black box": 1000,
};

const ItemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ItemWithQuantity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userItems, setUserItems] = useState<any>(null);
  const { selectedCharacter } = useGame();

  const currentCategory = searchParams.get("category") || "balls";

  const loadItems = useCallback(async () => {
    try {
      if (selectedCharacter) {
        setLoading(true);
        setError(null);

        const [itemsData, userItemsData] = await Promise.all([
          itemsApi.getItemsWithQuantity(
            currentCategory,
            selectedCharacter.user_id.toString()
          ),
          itemsApi.getUserItems(selectedCharacter.user_id.toString()),
        ]);
        setItems(itemsData);
        setUserItems(userItemsData);
      }
    } catch (err) {
      setError("שגיאה בטעינת הפריטים");
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCategoryChange = (category: string) => {
    setSearchParams({ category });
  };

  const handleSellItem = async (itemName: string, amount: number) => {
    try {
      const result = await itemsApi.sellItem({ name: itemName, amount, userId: selectedCharacter?.user_id! });
      if (result.success) {
        setSuccess(result.message || "הפריט נמכר בהצלחה");
        loadItems(); // רענון הנתונים
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "שגיאה במכירת הפריט");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError("שגיאה במכירת הפריט");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUseItem = async (
    itemName: string,
    soort: string,
    equip?: boolean
  ) => {
    try {
      const result = await itemsApi.useItem({ name: itemName, soort, equip });
      if (result.success) {
        setSuccess(result.message || "הפריט שומש בהצלחה");
        loadItems(); // רענון הנתונים
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || "שגיאה בשימוש בפריט");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError("שגיאה בשימוש בפריט");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const freeQuantity = () => {
    const myItems = Object.entries(userItems.gebruikers_item).reduce((a, b: Array<any>) => {
      if (b[0] === "user_id" || b[0] === "itembox") return 0;
      return a + b[1];
    }, 0) || 0;
    const myHouse: 'Bag' | "Yellow box" | "Blue box"| "Red box" | "Purple box" | "Black box" = userItems.gebruikers_item['itembox'];
    return ItemBox[myHouse] - myItems;
  }

  return (
    <ItemsContainer>
      <NPCBox>
        <h2>🎒 התיק שלך</h2>
        <p>
          כאן תוכל לשמור פריטים שונים וחפצים. אם התיק יתמלא, תצטרך לקנות תיק
          גדול יותר או למכור חלק מהפריטים שלך.
          <br />
          תמיד זכור לבדוק את המקום הפנוי בתיק שלך!
        </p>
      </NPCBox>

      {userItems && (
        <BackpackInfo>
          <span>🎒</span>
          <span>
            מקום פנוי:{" "}
            <strong>
              {freeQuantity()}
            </strong>
          </span>
        </BackpackInfo>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <CategoryTabs>
        {ITEM_CATEGORIES.map((category) => (
          <CategoryButton
            key={category.key}
            active={currentCategory === category.path}
            onClick={() => handleCategoryChange(category.path)}
          >
            {category.label}
          </CategoryButton>
        ))}
      </CategoryTabs>

      <ItemTable
        items={items}
        category={currentCategory}
        onSellItem={handleSellItem}
        onUseItem={handleUseItem}
      />
    </ItemsContainer>
  );
};

export default ItemsPage;
