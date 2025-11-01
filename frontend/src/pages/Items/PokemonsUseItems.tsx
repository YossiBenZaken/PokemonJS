import React, { useEffect, useState } from "react";
import { useGame } from "../../contexts/GameContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { ItemWithQuantity } from "../../models/item.model";
import { itemsApi } from "../../api/items.api";

const PokemonsUseItems: React.FC<{
  item: ItemWithQuantity | null;
  onClose: () => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  loadItems: () => Promise<void>;
}> = ({ item, onClose, setError, setSuccess, loadItems }) => {
  const { myPokemons, tmhmRelated, evolutionWithStone } = useGame();
  const [relatedTmhmIds, setRelatedTmhmIds] = useState<number[]>([]);

  const canUseItemOnPokemon = (pokemon: any): boolean => {
    if (!item) return false;
    if(item.soort === 'potions' || item.soort === 'special items') return true;
    if(item.soort === 'stones') {
      const evolution = evolutionWithStone.find(
        (evo) => evo.stone === item.naam && evo.wild_id === pokemon.wild_id
      );
      if (evolution) return true;
      return false;
    }
    if (item.soort !== "tm" && item.soort !== "hm") return false;
    const relatedTmhm = tmhmRelated.find(
      (tmhm) => tmhm.naam === item.naam
    );
    if (!relatedTmhm) return false;
    const relatedIds = relatedTmhm.relacionados
      .split(",")
      .map((id) => parseInt(id.trim(), 10));
    return relatedIds.includes(pokemon.wild_id);
  }

  const handleUseItem = async (pokemon: any) => {
    if (!item) return;
    // כאן תוכל להפעיל לוגיקה של שימוש בפריט על הפוקימון
    console.log(
      `Using item ${item?.naam} on pokemon ${pokemon.naam || pokemon.id}`
    );
    try {
      const result = await itemsApi.useItem({ name: item.naam, soort: item.soort, equip: item.equip, pokemonId: pokemon.id });
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

  return (
    <Dialog open={item != null} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>בחר פוקימון לשימוש בפריט</DialogTitle>
      <DialogContent>
        <List>
          {myPokemons.map((pokemon: any) => (
            <ListItem key={pokemon.id || pokemon.naam} divider sx={{
              justifyContent: 'space-between',
            }}>
              <img
                src={require(`../../assets/images/pokemon/${pokemon.wild_id}.gif`)}
                alt={pokemon.naam}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleUseItem(pokemon)}
                disabled={!canUseItemOnPokemon(pokemon)}
              >
                השתמש
              </Button>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="contained">
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PokemonsUseItems;
