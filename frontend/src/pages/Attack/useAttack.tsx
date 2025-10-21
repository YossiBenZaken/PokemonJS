const rarities = {
  1: {
    name: "נפוץ",
    color: "rgb(82, 196, 26)",
  },
  2: {
    name:"נדיר",
    color: "rgb(24, 144, 255)",
  },
  3: {
    name: "נדיר מאוד",
    color: "rgb(114, 46, 209)",
    },
    4: {
    name: "אגדי",
    color: "rgb(250, 140, 22)",
    },
    5: {
    name: "התחלתי",
    color: "rgb(245, 34, 45)",
    },
    6: {
    name: "מיסטיק",
    color: "rgb(0, 255, 255)",
    },
    7: {
    name: "מגה",
    color: "rgb(235, 47, 150)",
    },
    8: {
    name: "מיוחד",
    color: "rgb(255, 215, 0)",
    },
};

export const useAttack = () => {
  function getRareOfPokemon(zeldzaamheid: number): React.ReactNode {
    return rarities[zeldzaamheid as keyof typeof rarities].name;
  }

  function getColorOfPokemon(zeldzaamheid: number): string {
    return rarities[zeldzaamheid as keyof typeof rarities].color;
  }


  return { getRareOfPokemon, getColorOfPokemon };
};
