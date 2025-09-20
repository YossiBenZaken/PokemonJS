export interface MarketItem {
  id: number;
  naam: string;
  soort: 'balls' | 'items' | 'special items' | 'potions' | 'stones' | 'tm' | 'hm' | 'pokemon';
  silver: number;
  gold: number;
  omschrijving_he: string;
  omschrijving_en: string;
  beschikbaar: boolean;
  pokemonid?: number;
  zeldzaamheid?: number;
  desconto?: string;
}

export interface BuyItemRequest {
  itemId: number;
  amount: number;
  userId: number;
}

export interface BuyPokemonRequest {
  productId: number;
  userId: number;
}

export interface MarketCategory {
  key: string;
  label: string;
  path: string;
  icon: string;
}

export const MARKET_CATEGORIES: MarketCategory[] = [
  { key: 'balls', label: 'פוקידורים', path: 'balls', icon: '🎾' },
  { key: 'items', label: 'פריטים', path: 'items', icon: '🎒' },
  { key: 'specialitems', label: 'פריטים מיוחדים', path: 'specialitems', icon: '✨' },
  { key: 'potions', label: 'תרופות', path: 'potions', icon: '💊' },
  { key: 'stones', label: 'אבנים', path: 'stones', icon: '💎' },
  { key: 'pokemon', label: 'פוקימונים', path: 'pokemon', icon: '🥚' },
  { key: 'attacks', label: 'התקפות', path: 'attacks', icon: '📀' }
];

export interface UserInventory {
  silver: number;
  gold: number;
  item_over: number;
  itembox:  'Bag' | "Yellow box" | "Blue box"| "Red box" | "Purple box" | "Black box";
  items: number;
  myItems: object;
  in_hand: number;
}

export interface BuyResponse {
  success: boolean;
  message: string;
  newInventory?: UserInventory;
}

export interface PokemonRarity {
  value: number;
  name: string;
  color: string;
}

export const POKEMON_RARITIES: PokemonRarity[] = [
  { value: 1, name: 'נפוץ', color: '#95a5a6' },
  { value: 2, name: 'לא נפוץ', color: '#27ae60' },
  { value: 3, name: 'נדיר', color: '#3498db' },
  { value: 4, name: 'אגדי', color: '#e74c3c' }
];
