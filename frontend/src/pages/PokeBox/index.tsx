import "./style.css";

import {
  BoxInfoResponse,
  BoxSlot,
  Pokemon,
  configureBox,
  formatPokemonTooltip,
  getBoxInfo,
  getBoxPokemons,
  getHouseDisplayName,
  getHouseUpgradeMessage,
  getPokemonDisplayName,
  getPokemonImageUrl,
  getTopMedalIcon,
  movePokemon,
  releasePokemon,
  sellPokemon,
} from "../../api/pokebox.api";
import React, { useCallback, useEffect, useState } from "react";

import { useGame } from "../../contexts/GameContext";

const backgroundsMap: Record<string, string> = {
  פשוט: "simple2",
  יער: "forest",
  "יער (חוזר)": "forest2",
  עיר: "city",
  "עיר (חוזר)": "city2",
  מדבר: "desert",
  "מדבר (חוזר)": "desert2",
  סוואנה: "savanna",
  "סוואנה (חוזר)": "savanna2",
  צוק: "crag",
  "צוק (חוזר)": "crag2",
  "הר געש": "volcano",
  "הר געש (חוזר)": "volcano2",
  שלג: "snow",
  "שלג (חוזר)": "snow2",
  מערה: "cave",
  "מערה (חוזר)": "cave2",
  "חוף ים": "beach",
  "חוף ים (חוזר)": "beach2",
  "קרקעית הים": "seafloor",
  "קרקעית הים (חוזר)": "seafloor2",
  נהר: "river",
  "נהר (חוזר)": "river2",
  שמיים: "sky",
};

const PokeBox: React.FC = () => {
  const { selectedCharacter } = useGame();

  // Main state
  const [boxInfo, setBoxInfo] = useState<BoxInfoResponse["data"] | null>(null);
  const [boxSlots, setBoxSlots] = useState<BoxSlot[]>([]);
  const [currentBox, setCurrentBox] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // UI state
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [showPokemonDetails, setShowPokemonDetails] = useState(false);
  const [showBoxConfig, setShowBoxConfig] = useState(false);
  const [boxName, setBoxName] = useState("");
  const [boxBackground, setBoxBackground] = useState("");
  const [draggedPokemon, setDraggedPokemon] = useState<Pokemon | null>(null);

  // Load box info and Pokemon
  const loadBoxInfo = useCallback(async () => {
    if (!selectedCharacter) return;

    setLoading(true);
    try {
      const response = await getBoxInfo(selectedCharacter.user_id, currentBox);
      if (response.success && response.data) {
        setBoxInfo(response.data);
        setBoxName(response.data.box.name || "");
        setBoxBackground(response.data.box.background);
      }
    } catch (error) {
      setMessage({ type: "error", text: "שגיאה בטעינת מידע הקופסה" });
    } finally {
      setLoading(false);
    }
  }, [selectedCharacter, currentBox]);

  const loadBoxPokemons = useCallback(async () => {
    if (!selectedCharacter) return;

    try {
      const response = await getBoxPokemons(
        selectedCharacter.user_id,
        currentBox
      );
      if (response.success && response.data) {
        setBoxSlots(response.data.slots);
      }
    } catch (error) {
      setMessage({ type: "error", text: "שגיאה בטעינת פוקימוני הקופסה" });
    }
  }, [selectedCharacter, currentBox]);

  useEffect(() => {
    loadBoxInfo();
    loadBoxPokemons();
  }, [loadBoxInfo, loadBoxPokemons]);

  // Event handlers
  const handleBoxChange = (newBoxNumber: number) => {
    if (newBoxNumber < 1 || !boxInfo || newBoxNumber > boxInfo.box.maxBoxes)
      return;
    setCurrentBox(newBoxNumber);
  };

  const handleMovePokemon = async (
    from: "team" | "box",
    to: "team" | "box",
    pokemon: Pokemon,
    toSlot?: number
  ) => {
    if (!selectedCharacter) return;

    try {
      const response = await movePokemon({
        userId: selectedCharacter.user_id,
        pokemonId: pokemon.id,
        from,
        to,
        toSlot,
      });

      if (response.success) {
        setMessage({ type: "success", text: response.message });
        await loadBoxInfo();
        await loadBoxPokemons();
      } else {
        setMessage({ type: "error", text: response.message });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "שגיאה בהעברת פוקימון",
      });
    }
  };

  const handleSellPokemon = async (pokemon: Pokemon) => {
    if (!selectedCharacter) return;

    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך למכור את ${getPokemonDisplayName(pokemon)}?`
    );
    if (!confirmed) return;

    try {
      const response = await sellPokemon({
        userId: selectedCharacter.user_id,
        pokemonId: pokemon.id,
      });

      if (response.success) {
        setMessage({ type: "success", text: response.message });
        await loadBoxInfo();
        await loadBoxPokemons();
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "שגיאה במכירת פוקימון",
      });
    }
  };

  const handleReleasePokemon = async (pokemon: Pokemon) => {
    if (!selectedCharacter) return;

    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך לשחרר את ${getPokemonDisplayName(pokemon)} לטבע?`
    );
    if (!confirmed) return;

    try {
      const response = await releasePokemon({
        userId: selectedCharacter.user_id,
        pokemonId: pokemon.id,
      });

      if (response.success) {
        setMessage({ type: "success", text: response.message });
        await loadBoxInfo();
        await loadBoxPokemons();
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "שגיאה בשחרור פוקימון",
      });
    }
  };

  const handleConfigureBox = async () => {
    if (!selectedCharacter) return;

    try {
      const response = await configureBox({
        userId: selectedCharacter.user_id,
        boxNumber: currentBox,
        name: boxName,
        background: boxBackground,
      });

      if (response.success) {
        setMessage({ type: "success", text: response.message });
        setShowBoxConfig(false);
        await loadBoxInfo();
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "שגיאה בשמירת הגדרות הקופסה",
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (pokemon: Pokemon) => {
    setDraggedPokemon(pokemon);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    if (!draggedPokemon) return;

    if (draggedPokemon.opzak === "ja") {
      handleMovePokemon("team", "box", draggedPokemon, targetSlot);
    } else {
      handleMovePokemon("box", "box", draggedPokemon, targetSlot);
    }

    setDraggedPokemon(null);
  };

  const handleDropToTeam = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPokemon || draggedPokemon.opzak === "ja") return;

    handleMovePokemon("box", "team", draggedPokemon);
    setDraggedPokemon(null);
  };

  // Render components
  const renderPokemon = (pokemon: Pokemon, showMenu: boolean = true) => {
    const imageUrl = getPokemonImageUrl(pokemon, "");
    const displayName = getPokemonDisplayName(pokemon);
    const tooltip = formatPokemonTooltip(pokemon);

    return (
      <div
        key={pokemon.id}
        className="relative group cursor-move bg-white border-2 border-gray-200 rounded-lg p-2 hover:border-blue-400 transition-all duration-200 transform hover:scale-105"
        draggable
        onDragStart={() => handleDragStart(pokemon)}
        title={tooltip}
      >
        <div className="relative">
          <img
            src={imageUrl}
            alt={displayName}
            className="w-10 h-10 mx-auto object-contain"
          />

          {/* Status indicators */}
          {pokemon.item && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
          )}
          {pokemon.shiny === 1 && (
            <div className="absolute -top-1 -left-1 text-xs">✨</div>
          )}
          {pokemon.ei === 1 && (
            <div className="absolute bottom-0 right-0 text-xs">🥚</div>
          )}
        </div>

        {/* Action menu overlay */}
        {showMenu && (
          <div className="absolute inset-0 bg-black bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center rounded-lg text-xs gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPokemon(pokemon);
                setShowPokemonDetails(true);
              }}
              className="text-white hover:text-blue-300 transition-colors"
            >
              פרטים
            </button>
            {pokemon.opzak === "nee" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMovePokemon("box", "team", pokemon);
                }}
                className="text-white hover:text-green-300 transition-colors"
              >
                לצוות
              </button>
            )}
            {pokemon.opzak === "ja" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMovePokemon("team", "box", pokemon);
                }}
                className="text-white hover:text-blue-300 transition-colors"
              >
                לקופסה
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSellPokemon(pokemon);
              }}
              className="text-white hover:text-yellow-300 transition-colors"
            >
              מכור
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReleasePokemon(pokemon);
              }}
              className="text-white hover:text-red-300 transition-colors"
            >
              שחרר
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderBoxSlot = (slot: BoxSlot) => {
    if (slot.pokemon) {
      return renderPokemon(slot.pokemon);
    }

    return (
      <div
        className="w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, slot.slotNumber)}
      >
        <span className="text-xs text-gray-400">{slot.slotNumber}</span>
      </div>
    );
  };

  const renderHouseSidebar = () => (
    <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">
          {getHouseDisplayName(boxInfo!.user.huis)}
        </h3>
        <p className="text-sm opacity-90">
          מקום ל-{boxInfo!.house.capacity.toLocaleString()} פוקימונים
        </p>

        <div className="my-4">
          <img
            src={`/images/${boxInfo!.house.image}`}
            alt={boxInfo!.house.name}
            className="mx-auto max-w-24 max-h-24 object-contain"
          />
        </div>

        <div className="space-y-3 text-sm bg-blue-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex justify-between">
            <span>פוקימון רמה 100:</span>
            <span className="font-bold">{boxInfo!.stats.level100Pokemon}</span>
          </div>

          <div>
            <div className="mb-2">פוקימון TOP 3:</div>
            <div className="flex justify-center items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <img
                  src="/images/icons/medal3.png"
                  className="w-4 h-4"
                  alt="מקום 3"
                />
                <span>{boxInfo!.stats.top3Pokemon}</span>
              </div>
              <span>|</span>
              <div className="flex items-center gap-1">
                <img
                  src="/images/icons/medal2.png"
                  className="w-4 h-4"
                  alt="מקום 2"
                />
                <span>{boxInfo!.stats.top2Pokemon}</span>
              </div>
              <span>|</span>
              <div className="flex items-center gap-1">
                <img
                  src="/images/icons/medal1.png"
                  className="w-4 h-4"
                  alt="מקום 1"
                />
                <span>{boxInfo!.stats.top1Pokemon}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-lg font-bold bg-white bg-opacity-20 rounded-lg p-3">
          {boxInfo!.house.spotsLeft} מקומות פנויים
        </div>
      </div>
    </div>
  );

  const renderTeamSection = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">הצוות הנוכחי:</h3>
      <div className="grid grid-cols-6 gap-3">
        {boxInfo!.teamPokemons.map((pokemon) => renderPokemon(pokemon))}

        {Array.from({ length: 6 - boxInfo!.teamPokemons.length }).map(
          (_, index) => (
            <div
              key={`empty-team-${index}`}
              className="w-14 h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-green-400 hover:bg-green-50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDropToTeam}
            >
              <span className="text-xs text-gray-400">ריק</span>
            </div>
          )
        )}
      </div>
    </div>
  );

  const renderBoxNavigation = () => (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => handleBoxChange(currentBox - 1)}
        disabled={currentBox <= 1}
        className="p-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        → קופסה קודמת
      </button>

      <div className="flex items-center gap-4">
        <select
          value={currentBox}
          onChange={(e) => handleBoxChange(parseInt(e.target.value))}
          className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          {Array.from({ length: boxInfo!.box.maxBoxes }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              קופסה {i + 1}{" "}
              {i + 1 === currentBox && boxInfo!.box.name
                ? `(${boxInfo!.box.name})`
                : ""}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowBoxConfig(true)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ⚙️ הגדרות
        </button>
      </div>

      <button
        onClick={() => handleBoxChange(currentBox + 1)}
        disabled={currentBox >= boxInfo!.box.maxBoxes}
        className="p-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        קופסה הבאה ←
      </button>
    </div>
  );

  // Loading and error states
  if (!selectedCharacter) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-gray-500 text-lg">
          בחר דמות כדי לראות קופסת פוקימון
        </div>
      </div>
    );
  }

  if (!boxInfo && !loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-red-500 text-lg">
          שגיאה בטעינת מידע הקופסה
        </div>
      </div>
    );
  }

  if (loading && !boxInfo) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
          <span className="text-lg">טוען מידע הקופסה...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-3">קופסת פוקימון</h1>
        <p className="text-center text-lg opacity-90">
          ברוך הבא לקופסה שלך, מאמן! כאן תוכל לשמור, לארגן ולנהל את הפוקימונים
          שלך
        </p>
      </div>

      {/* Warnings */}
      {boxInfo!.user.inHand === 0 && (
        <div className="bg-red-100 border-r-4 border-red-500 text-red-700 px-6 py-4 rounded-lg">
          ⚠️ מסוכן להסתובב בלי אף פוקימון איתך! קח לפחות פוקימון אחד והמשך את
          ההרפתקה שלך.
        </div>
      )}

      {boxInfo!.house.spotsLeft <= 5 && boxInfo!.user.huis !== "villa" && (
        <div className="bg-blue-100 border-r-4 border-blue-500 text-blue-700 px-6 py-4 rounded-lg">
          🏠 {getHouseUpgradeMessage(boxInfo!.user.huis)}
        </div>
      )}

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg border-r-4 ${
            message.type === "success"
              ? "bg-green-100 border-green-500 text-green-700"
              : "bg-red-100 border-red-500 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* House Info Sidebar */}
        <div className="lg:col-span-1">{renderHouseSidebar()}</div>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-6">
          {/* Team Pokemon */}
          {renderTeamSection()}

          {/* Box Navigation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderBoxNavigation()}

            {/* Box Slots Grid */}
            <div
              className={`${boxInfo?.box.background} p-1 rounded-lg border-2 border-gray-300`}
            >
              <div className="grid grid-cols-13 gap-1">
                {boxSlots.map((slot) => (
                  <div key={slot.slotNumber}>{renderBoxSlot(slot)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pokemon Details Modal */}
      {showPokemonDetails && selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center mb-4">
              <img
                src={getPokemonImageUrl(selectedPokemon, "")}
                alt={getPokemonDisplayName(selectedPokemon)}
                className="w-16 h-16 mx-auto mb-2"
              />
              <h3 className="text-xl font-bold text-gray-800">
                {getPokemonDisplayName(selectedPokemon)}
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">רמה:</span>
                <span>{selectedPokemon.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">סוג:</span>
                <span>
                  {selectedPokemon.type1}
                  {selectedPokemon.type2 ? `/${selectedPokemon.type2}` : ""}
                </span>
              </div>
              {selectedPokemon.shiny === 1 && (
                <div className="text-yellow-600 font-medium">✨ שיני</div>
              )}
              {selectedPokemon.ei === 1 && (
                <div className="text-blue-600 font-medium">🥚 ביצה</div>
              )}
              {selectedPokemon.item && (
                <div className="flex justify-between">
                  <span className="font-medium">פריט:</span>
                  <span>{selectedPokemon.item}</span>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPokemonDetails(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Box Configuration Modal */}
      {showBoxConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              הגדרות קופסה {currentBox}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  שם הקופסה:
                </label>
                <input
                  type="text"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="שם הקופסה (אופציונלי)"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  רקע:
                </label>
                <select
                  value={boxBackground}
                  onChange={(e) => setBoxBackground(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {Object.entries(backgroundsMap).map(([hebrew, value]) => (
                    <option key={value} value={value}>
                      {hebrew}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowBoxConfig(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleConfigureBox}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                שמור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 ml-3"></div>
              <span className="text-lg">מעבד...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokeBox;
