import {
  MarketItem,
  POKEMON_RARITIES,
  UserInventory,
} from "../../../models/market.model";
import React, { useState } from "react";

import { ItemBox } from "../../Items";
import styled from "styled-components";

const CardContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ItemImage = styled.img`
  width: 64px;
  height: 64px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ItemName = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
`;

const ItemDescription = styled.p`
  color: #666;
  font-size: 12px;
  margin-bottom: 15px;
  line-height: 1.4;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 15px;
`;

const CurrencyIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const Price = styled.span<{ currency: "silver" | "gold" }>`
  font-weight: 700;
  font-size: 18px;
  color: ${(props) => (props.currency === "gold" ? "#f39c12" : "#27ae60")};
`;

const RarityBadge = styled.div<{ rarity: number }>`
  background: ${(props) => {
    const rarity = POKEMON_RARITIES.find((r) => r.value === props.rarity);
    return rarity ? rarity.color : "#95a5a6";
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 10px;
  display: inline-block;
`;

const QuantityInput = styled.input`
  width: 80px;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const BuyButton = styled.button<{ disabled: boolean }>`
  background: ${(props) => (props.disabled ? "#bdc3c7" : "#e74c3c")};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #c0392b;
    transform: translateY(-1px);
  }
`;

const PokemonButton = styled.button<{ disabled: boolean }>`
  background: ${(props) => (props.disabled ? "#bdc3c7" : "#9b59b6")};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #8e44ad;
    transform: translateY(-1px);
  }
`;

const DiscountText = styled.div`
  color: #e74c3c;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
`;

interface MarketItemCardProps {
  item: MarketItem;
  onBuyItem: (itemId: number, amount: number) => void;
  onBuyPokemon: (productId: number) => void;
  inventory: UserInventory | null;
}

const MarketItemCard: React.FC<MarketItemCardProps> = ({
  item,
  onBuyItem,
  onBuyPokemon,
  inventory,
}) => {

  const [quantity, setQuantity] = useState(1);

  const getItemImage = () => {
    if (item.pokemonid) {
      return require("../../../assets/images/icons/egg.gif");
    }
    if (item.soort === "tm" || item.soort === "hm") {
      return require("../../../assets/images/items/Attack_Normal.png"); // ברירת מחדל
    }
    return require(`../../../assets/images/items/${item.naam}.png`);
  };

  const getCurrencyIcon = () => {
    return item.gold > 0
      ? require("../../../assets/images/icons/gold.png")
      : require("../../../assets/images/icons/silver.png");
  };

  const getPrice = () => {
    return item.gold > 0 ? item.gold : item.silver;
  };

  const getCurrency = (): "silver" | "gold" => {
    return item.gold > 0 ? "gold" : "silver";
  };

  const canAfford = () => {
    if (!inventory) return false;
    const price = getPrice();
    const currency = getCurrency();

    if (currency === "gold") {
      return inventory.gold >= price * quantity;
    } else {
      return inventory.silver >= price * quantity;
    }
  };

  const hasSpace = () => {
    if (!inventory) return false;
    return inventory.item_over >= quantity;
  };

  const canBuyPokemon = () => {
    if (!inventory) return false;
    return inventory.in_hand < 6 && canAfford();
  };

  const handleBuy = () => {
    if (item.pokemonid) {
      onBuyPokemon(item.id);
    } else {
      onBuyItem(item.id, quantity);
    }
  };

  const getRarityName = () => {
    const rarity = POKEMON_RARITIES.find((r) => r.value === item.zeldzaamheid);
    return rarity ? rarity.name : "לא ידוע";
  };

  const isDisabled = () => {
    if (item.soort === "pokemon") {
      return !canBuyPokemon();
    } else {
      return !canAfford() || !hasSpace();
    }
  };

  const filteredBag = () =>{
    const currentCapacity = ItemBox[inventory?.itembox!];
    const capacity = ItemBox[item.naam as keyof typeof ItemBox];
    return capacity !== undefined && capacity < currentCapacity;
  }

  if(item.soort === 'items') {
    if(Object.keys(inventory?.myItems!).includes(item.naam)) {
      return null;
    }
    if(inventory?.itembox === item.naam){
      return null;
    }
    if(filteredBag()) {
      return null;
    }
  }
  return (
    <CardContainer>
      <ItemImage
        src={getItemImage()}
        alt={item.naam}
        title={item.omschrijving_he || item.omschrijving_en}
      />

      {item.zeldzaamheid && (
        <RarityBadge rarity={item.zeldzaamheid}>{getRarityName()}</RarityBadge>
      )}

      <ItemName>{item.naam}</ItemName>

      <ItemDescription>
        {item.omschrijving_he || item.omschrijving_en}
      </ItemDescription>

      {item.desconto && <DiscountText>{item.desconto}</DiscountText>}

      <PriceContainer>
        <CurrencyIcon src={getCurrencyIcon()} alt={getCurrency()} />
        <Price currency={getCurrency()}>{getPrice().toLocaleString()}</Price>
      </PriceContainer>

      {(!item.pokemonid && item.soort !== 'items') && (
        <QuantityInput
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, parseInt(e.target.value) || 1))
          }
        />
      )}

      {item.pokemonid ? (
        <PokemonButton disabled={isDisabled()} onClick={handleBuy}>
          קנה פוקימון
        </PokemonButton>
      ) : (
        <BuyButton disabled={isDisabled()} onClick={handleBuy}>
          קנה
        </BuyButton>
      )}
    </CardContainer>
  );
};

export default MarketItemCard;
