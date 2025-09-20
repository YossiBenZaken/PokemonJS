import React, { useState } from 'react';

import { ItemWithQuantity } from '../../models/item.model';
import styled from 'styled-components';

const TableContainer = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody`
  background: white;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  vertical-align: middle;
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
`;

const ItemImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ItemName = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Quantity = styled.span`
  font-weight: 700;
  color: #4a90e2;
  font-size: 16px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
`;

const CurrencyIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const Price = styled.span`
  font-weight: 600;
  color: #27ae60;
`;

const SellForm = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
`;

const AmountInput = styled.input`
  width: 80px;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SellButton = styled(ActionButton)`
  background: #e74c3c;
  color: white;
  
  &:hover:not(:disabled) {
    background: #c0392b;
    transform: translateY(-1px);
  }
`;

const UseButton = styled(ActionButton)`
  background: #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-1px);
  }
`;

const NoItemsMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
  background: #f8f9fa;
  border-radius: 10px;
`;

interface ItemTableProps {
  items: ItemWithQuantity[];
  category: string;
  onSellItem: (itemName: string, amount: number) => void;
  onUseItem: (itemName: string, soort: string, equip?: boolean) => void;
}

const ItemTable: React.FC<ItemTableProps> = ({ items, category, onSellItem, onUseItem }) => {
  const [sellAmounts, setSellAmounts] = useState<{ [key: string]: number }>({});

  const handleSellAmountChange = (itemName: string, value: string) => {
    const amount = parseInt(value) || 0;
    setSellAmounts(prev => ({
      ...prev,
      [itemName]: amount
    }));
  };

  const handleSellSubmit = (e: React.FormEvent, itemName: string) => {
    e.preventDefault();
    const amount = sellAmounts[itemName] || 0;
    if (amount > 0) {
      onSellItem(itemName, amount);
      setSellAmounts(prev => ({
        ...prev,
        [itemName]: 0
      }));
    }
  };

  const getItemImage = (item: ItemWithQuantity) => {
    if (item.soort === 'tm' || item.soort === 'hm') {
      // עבור TM/HM נצטרך לקבל את סוג ההתקפה
      return require(`../../assets/images/items/Attack_Normal.png`); // ברירת מחדל
    }
    return require(`../../assets/images/items/${item.naam}.png`);
  };

  const getCurrencyIcon = (currency: string) => {
    return require(`../../assets/images/icons/${currency}.png`);
  };

  const canSell = (item: ItemWithQuantity) => {
    return item.soort !== 'items' && item.quantity > 0;
  };

  const canUse = (item: ItemWithQuantity) => {
    return ['stones', 'special items', 'potions', 'tm', 'hm'].includes(item.soort) && item.quantity > 0;
  };

  if (items.length === 0) {
    return (
      <NoItemsMessage>
        אין פריטים בקטגוריה זו
      </NoItemsMessage>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableHeaderCell>שם</TableHeaderCell>
            <TableHeaderCell>כמות</TableHeaderCell>
            <TableHeaderCell>מחיר מכירה</TableHeaderCell>
            <TableHeaderCell>מכירה</TableHeaderCell>
            {['stones', 'special items', 'potions', 'tm', 'hm'].includes(category) && (
              <TableHeaderCell>שימוש</TableHeaderCell>
            )}
          </tr>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <ItemInfo>
                  <ItemImage
                    src={getItemImage(item)}
                    alt={item.naam}
                    title={item.omschrijving_he || item.omschrijving_en}
                  />
                  <ItemName>{item.naam}</ItemName>
                </ItemInfo>
              </TableCell>
              
              <TableCell>
                <Quantity>{item.quantity}x</Quantity>
              </TableCell>
              
              <TableCell>
                <PriceContainer>
                  <CurrencyIcon src={getCurrencyIcon(item.currency)} alt={item.currency} />
                  <Price>{item.sellPrice}</Price>
                </PriceContainer>
              </TableCell>
              
              <TableCell>
                {canSell(item) ? (
                  <SellForm onSubmit={(e) => handleSellSubmit(e, item.naam)}>
                    <AmountInput
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={sellAmounts[item.naam] || ''}
                      onChange={(e) => handleSellAmountChange(item.naam, e.target.value)}
                      placeholder="כמות"
                    />
                    <SellButton type="submit" disabled={!sellAmounts[item.naam] || sellAmounts[item.naam] <= 0}>
                      מכירה
                    </SellButton>
                  </SellForm>
                ) : (
                  <span style={{ color: '#999' }}>לא ניתן למכור</span>
                )}
              </TableCell>
              
              {['stones', 'special items', 'potions', 'tm', 'hm'].includes(category) && (
                <TableCell>
                  {canUse(item) ? (
                    <UseButton
                      onClick={() => onUseItem(item.naam, item.soort, item.equip)}
                    >
                      שימוש
                    </UseButton>
                  ) : (
                    <span style={{ color: '#999' }}>לא ניתן להשתמש</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ItemTable;
