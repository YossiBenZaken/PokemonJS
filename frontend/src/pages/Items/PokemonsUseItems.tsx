import React, { useState } from "react";
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
  const { myPokemons } = useGame();

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
