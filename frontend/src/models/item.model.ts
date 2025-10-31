export interface Item {
  id: number;
  naam: string;
  soort:
    | "balls"
    | "items"
    | "special items"
    | "potions"
    | "stones"
    | "tm"
    | "hm";
  omschrijving_he: string;
  omschrijving_en: string;
  silver: number;
  gold: number;
  tickets?: number;
  equip: boolean;
}

export interface UserItem {
  user_id: number;
  [key: string]: number | string;
}

export interface UserTMHM {
  user_id: number;
  [key: string]: number | string;
}

export interface ItemData {
  gebruikers_item: UserItem;
  gebruikers_tmhm: UserTMHM;
}

export interface SellItemRequest {
  name: string;
  amount: number;
  userId: number;
}

export interface UseItemRequest {
  name: string;
  soort: string;
  equip?: boolean;
  pokemonId?: number;
  evolveId?: number;
}

export interface ItemCategory {
  key: string;
  label: string;
  path: string;
}

export const ITEM_CATEGORIES: ItemCategory[] = [
  { key: "balls", label: "פוקידורים", path: "balls" },
  { key: "items", label: "פריטים", path: "items" },
  { key: "special items", label: "פריטים מיוחדים", path: "spc_items" },
  { key: "potions", label: "תרופות", path: "potions" },
  { key: "stones", label: "אבנים", path: "stones" },
  { key: "hm", label: "HM - מכונות חבויות", path: "hm" },
  { key: "tm", label: "TM - מכונות הוראה", path: "tm" },
];

export interface ItemWithQuantity extends Item {
  quantity: number;
  sellPrice: number;
  currency: "silver" | "gold" | "tickets";
}

export interface ItemInfo {
  id: number;
  soort: string;
  beschikbaar: number;
  pokemonid: number;
  naam: string;
  silver: number;
  gold: number;
  omschrijving_en: string;
  roleta: string;
  desconto: string;
  equip: number;
}
