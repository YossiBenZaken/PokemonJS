import React, { useEffect, useState } from "react";
import {
  TRADER_INFO,
  Trader,
  executeTrade,
  getTraders,
  refreshTraders
} from "../../../api/traders.api";

import { useGame } from "../../../contexts/GameContext";

const Traders: React.FC = () => {
  const { selectedCharacter } = useGame();
  
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadTraders = async () => {
    setLoading(true);
    try {
      const response = await getTraders();
      if (response.success && response.data) {
        setTraders(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar comerciantes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraders();
    // Check if user is admin (you'd need to implement this check)
    setIsAdmin(selectedCharacter?.admin! > 0);
  }, [selectedCharacter?.user_id]);

  const handleTrade = async (traderName: string) => {
    if (!selectedCharacter || !selectedCharacter.rank) return;

    // Check user rank
    if (selectedCharacter.rank < 4) {
      setMessage({ 
        type: 'error', 
        text: 'דרגה מינימלית להחלפת פוקימונים: 4 - מאמן ראשון. המשך לעלות רמות כדי לפתוח!' 
      });
      return;
    }

    const confirmed = window.confirm(`האם אתה באמת רוצה לסחור עם ${traderName}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await executeTrade({
        userId: selectedCharacter.user_id,
        traderName
      });

      let messageText = response.message;
      if (response.bonusMessage) {
        messageText += ` ${response.bonusMessage}`;
      }

      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: messageText 
      });

      if (response.success) {
        loadTraders(); // Refresh traders after successful trade
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בביצוע החלפה' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTraders = async () => {
    if (!selectedCharacter) return;

    const confirmed = window.confirm('האם אתה באמת רוצה לאפס את כל הסוחרים?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await refreshTraders({
        userId: selectedCharacter.user_id
      });

      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });

      if (response.success) {
        loadTraders();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בעדכון הסוחרים' });
    } finally {
      setLoading(false);
    }
  };

  const renderTrader = (trader: Trader) => {
    const traderInfo = TRADER_INFO[trader.eigenaar];
    if (!traderInfo) return null;

    let dialogText = '';
    let showTradeButton = false;

    if (!trader.hasOffer || !trader.wil || !trader.naam) {
      dialogText = traderInfo.noOfferText;
    } else {
      dialogText = traderInfo.offerTextTemplate(trader.wil, trader.naam);
      showTradeButton = selectedCharacter! && selectedCharacter.rank! >= 4;
    }

    return (
      <div key={trader.eigenaar} className="bg-white rounded-lg shadow-lg mb-4">
        <div className="flex flex-col md:flex-row">
          {/* Trader Image */}
          <div className="md:w-40 flex justify-center items-center p-4 bg-gradient-to-b from-blue-50 to-blue-100">
            <img
              src={traderInfo.image}
              alt={traderInfo.name}
              className="max-w-[97px] max-h-[200px] object-contain"
            />
          </div>

          {/* Trader Dialog */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{traderInfo.name}</h3>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 italic">"{dialogText}"</p>
              </div>
            </div>

            {/* Trade Info */}
            {trader.hasOffer && trader.wil && trader.naam && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-red-600">הוא רוצה: </span>
                    <span className="text-red-800">{trader.wil}</span>
                  </div>
                  <div className="text-2xl">⇄</div>
                  <div>
                    <span className="font-semibold text-green-600">הוא מציע: </span>
                    <span className="text-green-800">{trader.naam}</span>
                  </div>
                </div>
                {trader.eigenaar === 'Wayne' && (
                  <div className="mt-2 text-center">
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                      +100 כסף בונוס!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Trade Button */}
            {showTradeButton && (
              <button
                onClick={() => handleTrade(trader.eigenaar)}
                disabled={loading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                החלפה עם {trader.eigenaar}
              </button>
            )}

            {/* Rank Warning */}
            {trader.hasOffer && selectedCharacter && selectedCharacter.rank! < 4 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2">
                <p className="text-sm">
                דרגה לא מספקת (מינימום: 4 - מאמן ראשון)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">סוחרים</h1>
        <p className="text-center">
        סחור בפוקימונים שלך עם סוחרים מומחים!
        </p>
        {selectedCharacter && selectedCharacter.rank! < 4 && (
          <div className="bg-red-500 bg-opacity-50 mt-4 p-3 rounded">
            <p className="text-center font-semibold">
            דרגה מינימלית להחלפה: 4 - מאמן ראשון. המשך לעלות רמה כדי לפתוח!
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Traders */}
      {loading && traders.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">טוען סוחרים...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {traders.map(renderTrader)}
        </div>
      )}

      {/* Admin Section */}
      {isAdmin && (
        <div className="bg-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-bold mb-4 text-center">אזור מנהל</h2>
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              <strong>עדכון פוקימונים מסוחרים</strong>
            </p>
            <button
              onClick={handleRefreshTraders}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              איפוס סוחרים
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {traders.length === 0 && !loading && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
          אין סוחרים זמינים
          </h3>
          <p className="text-gray-500">
          לסוחרים אין כרגע מבצעים. בדוק שוב מאוחר יותר!
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
              <span className="text-lg">עיבוד...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Traders;