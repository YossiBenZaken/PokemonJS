import {
  DaycarePokemon,
  DaycareStatus,
  Pokemon,
  acceptEgg,
  getDaycareStatus,
  leavePokemonAtDaycare,
  rejectEgg,
  takePokemonFromDaycare,
} from "../../../api/daycare.api";
import React, { useEffect, useState } from "react";

import { useGame } from "../../../contexts/GameContext";

const SILVER_ICON = require("../../../assets/images/icons/silver.png");

const Daycare: React.FC = () => {
  const { selectedCharacter } = useGame();
  const [daycareData, setDaycareData] = useState<DaycareStatus | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadDaycareData = async () => {
    if (!selectedCharacter) return;

    setLoading(true);
    try {
      const response = await getDaycareStatus(selectedCharacter.user_id);
      if (response.success && response.data) {
        setDaycareData(response.data);
        if (response.data.teamPokemons.length > 0) {
          setSelectedPokemon(response.data.teamPokemons[0]);
        }
      } else {
        setMessage({
          type: "error",
          text: response.message || "Error loading data",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error loading kindergarten" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDaycareData();
  }, [selectedCharacter]);

  const handleAcceptEgg = async () => {
    if (!selectedCharacter) return;

    setLoading(true);
    try {
      const response = await acceptEgg(selectedCharacter.user_id);
      setMessage({
        type: response.success ? "success" : "error",
        text: response.message,
      });
      if (response.success) {
        loadDaycareData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error accepting egg" });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEgg = async () => {
    if (!selectedCharacter) return;

    setLoading(true);
    try {
      const response = await rejectEgg(selectedCharacter.user_id);
      setMessage({
        type: response.success ? "success" : "error",
        text: response.message,
      });
      if (response.success) {
        loadDaycareData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error rejecting egg" });
    } finally {
      setLoading(false);
    }
  };

  const handleLeavePokemon = async () => {
    if (!selectedCharacter || !selectedPokemon) return;

    setLoading(true);
    try {
      const response = await leavePokemonAtDaycare(
        selectedCharacter.user_id,
        selectedPokemon.id
      );
      setMessage({
        type: response.success ? "success" : "error",
        text: response.message,
      });
      if (response.success) {
        loadDaycareData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error leaving Pokemon" });
    } finally {
      setLoading(false);
    }
  };

  const handleTakePokemon = async (pokemonId: number) => {
    if (!selectedCharacter) return;

    setLoading(true);
    try {
      const response = await takePokemonFromDaycare(
        selectedCharacter.user_id,
        pokemonId
      );
      setMessage({
        type: response.success ? "success" : "error",
        text: response.message,
      });
      if (response.success) {
        loadDaycareData();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error removing Pokemon" });
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = (daycarePokemon: DaycarePokemon) => {
    return 250 + daycarePokemon.levelup * 500;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading && !daycareData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!daycareData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-red-600">
          Error loading kindergarten data
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Kindergarten</h1>
        <p className="text-center mt-2">
          {daycareData.user.isPremium
            ? "משתמש פרימיום - 2 משרות פנויות"
            : "משתמש רגיל - משרה פנויה אחת"}
        </p>
        <div className="flex justify-center items-center mt-2">
          <img src={SILVER_ICON} alt="Silver" className="w-5 h-5 mr-2" />
          <span className="text-xl">
            {formatNumber(daycareData.user.silver)}
          </span>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Egg Section */}
      {daycareData.egg && (
        <div className="bg-white border-2 border-yellow-400 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-center text-yellow-600 mb-4">
            🥚 יש לך ביצה מוכנה לבקוע!
          </h2>
          <p className="text-center mb-4">
            Pokemon:{" "}
            <span className="font-semibold">{daycareData.egg.naam}</span>
            {daycareData.egg.levelup === "1" && (
              <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                ✨ Shiny
              </span>
            )}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleAcceptEgg}
              disabled={loading || daycareData.user.inHand >= 6}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              קבל ביצה
            </button>
            <button
              onClick={handleRejectEgg}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400"
            >
              דחה ביצה
            </button>
          </div>
          {daycareData.user.inHand >= 6 && (
            <p className="text-red-600 text-center mt-2">הצוות מלא!</p>
          )}
        </div>
      )}

      {/* Team Pokemon Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">הצוות שלי</h2>

        {daycareData.teamPokemons.length === 0 ? (
          <p className="text-center text-gray-500">אין פוקימונים בקבוצה</p>
        ) : (
          <>
            {/* Pokemon Carousel */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-4 pb-4 max-w-full">
                {daycareData.teamPokemons.map((pokemon, index) => (
                  <div
                    key={pokemon.id}
                    onClick={() => setSelectedPokemon(pokemon)}
                    className={`flex justify-center items-center min-w-[120px] min-h-[150px] p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPokemon?.id === pokemon.id
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">
                          {pokemon.ei ? <img
                            src={require(`../../../assets/pokemon/egg.png`)}
                            alt={pokemon.naam}
                          /> : <img
                          src={require(`../../../assets/images/${
                            pokemon.shiny ? "shiny" : "pokemon"
                          }/${pokemon.wild_id}.gif`)}
                          alt={pokemon.naam}
                        />}
                          
                        </span>
                      </div>
                      <div className="text-sm font-semibold truncate"></div>
                      <div className="text-sm font-semibold truncate">
                        {pokemon.naam}
                      </div>
                      <div className="text-xs text-gray-500">
                        רמה {pokemon.level}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Pokemon Info */}
            {selectedPokemon && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold">{selectedPokemon.naam}</h3>
                  <p className="text-gray-600">
                    רָמָה {selectedPokemon.level} • {selectedPokemon.type1}
                    {selectedPokemon.type2 && ` / ${selectedPokemon.type2}`}
                  </p>
                  {selectedPokemon.shiny === "1" && (
                    <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                      Shiny
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Leave Pokemon Button */}
            <div className="text-center">
              <button
                onClick={handleLeavePokemon}
                disabled={
                  loading ||
                  !selectedPokemon ||
                  daycareData.user.inHand <= 1 ||
                  daycareData.daycarePokemons.length >=
                    daycareData.user.maxSlots ||
                  selectedPokemon.level >= 100 ||
                  selectedPokemon.type1 === "Shadow"
                }
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
              >
                עזבו את הפוקימון
              </button>

              {/* Warning messages */}
              {daycareData.user.inHand <= 1 && (
                <p className="text-red-600 mt-2 text-sm">
                  אתה צריך שיהיה לך לפחות פוקימון אחד בצוות
                </p>
              )}
              {daycareData.daycarePokemons.length >=
                daycareData.user.maxSlots && (
                <p className="text-red-600 mt-2 text-sm">
                  גן הילדים מלא ב-({daycareData.user.maxSlots} מקומות)
                </p>
              )}
              {selectedPokemon?.level! >= 100 && (
                <p className="text-red-600 mt-2 text-sm">
                  פוקימון כבר ברמה המקסימלית
                </p>
              )}
              {selectedPokemon?.type1 === "Shadow" && (
                <p className="text-red-600 mt-2 text-sm">
                  פוקימון צל לא יכול להישאר בגן
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Daycare Pokemon Section */}
      {daycareData.daycarePokemons.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            פוקימון בגן ילדים
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <th className="p-3 text-center border">#</th>
                  <th className="p-3 text-center border">שֵׁם</th>
                  <th className="p-3 text-center border">רָמָה</th>
                  <th className="p-3 text-center border">עלייה ברמה</th>
                  <th className="p-3 text-center border">עֲלוּת</th>
                  <th className="p-3 text-center border">פְּעוּלָה</th>
                </tr>
              </thead>
              <tbody>
                {daycareData.daycarePokemons.map((pokemon) => {
                  const newLevel = pokemon.level + pokemon.levelup;
                  const cost = calculateCost(pokemon);
                  const canAfford = daycareData.user.silver >= cost;
                  const hasSpace = daycareData.user.inHand < 6;

                  return (
                    <tr key={pokemon.pokemonid} className="hover:bg-gray-50">
                      <td className="p-3 text-center border">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                          <span className="text-xl">
                            <img
                              src={require(`../../../assets/images/${
                                pokemon.shiny ? "shiny" : "pokemon"
                              }/${pokemon.wild_id}.gif`)}
                              alt={pokemon.naam}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center border font-semibold">
                        {pokemon.naam}
                        {pokemon.shiny === "1" && (
                          <span className="ml-2 px-1 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">
                            Shiny
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center border">
                        {pokemon.level} → {newLevel}
                      </td>
                      <td className="p-3 text-center border">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          +{pokemon.levelup}
                        </span>
                      </td>
                      <td className="p-3 text-center border">
                        <div className="flex items-center justify-center">
                          <img
                            src={SILVER_ICON}
                            alt="Silver"
                            className="w-4 h-4 mr-1"
                          />
                          <span
                            className={
                              canAfford ? "text-green-600" : "text-red-600"
                            }
                          >
                            {formatNumber(cost)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center border">
                        <button
                          onClick={() => handleTakePokemon(pokemon.pokemonid)}
                          disabled={loading || !canAfford || !hasSpace}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          להסרה
                        </button>
                        {!canAfford && (
                          <p className="text-xs text-red-600 mt-1">חוסר כסף</p>
                        )}
                        {!hasSpace && (
                          <p className="text-xs text-red-600 mt-1">צוות מלא</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty Daycare Message */}
      {daycareData.daycarePokemons.length === 0 && !daycareData.egg && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            גן ילדים ריק
          </h3>
          <p className="text-gray-500">
            השאירו את הפוקימונים שלכם כאן כדי שיוכלו לגדול ולהתפתח!
          </p>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-lg">עיבוד...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Daycare;
