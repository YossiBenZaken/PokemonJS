import fetch from "node-fetch";

export async function getKantoPokemon() {
  // PokeAPI: https://pokeapi.co/api/v2/pokemon?limit=151&offset=0
  const url = "https://pokeapi.co/api/v2/pokemon?limit=151&offset=0";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch Kanto Pokemon");
  const data = await response.json();
  return data.results; // [{ name, url }]
}
