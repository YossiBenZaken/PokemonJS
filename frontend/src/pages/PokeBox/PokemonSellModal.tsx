import {
  PokemonSellInfo,
  getPokemonDisplayName,
  getPokemonImageUrl,
  getPokemonSellInfo,
  sellPokemon
} from "../../api/pokebox.api";
import React, { useEffect, useState } from "react";

import { useGame } from "../../contexts/GameContext";

interface PokemonSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonId: number;
  onSuccess: () => void;
}

const PokemonSellModal: React.FC<PokemonSellModalProps> = ({
  isOpen,
  onClose,
  pokemonId,
  onSuccess
}) => {
    const {selectedCharacter} = useGame();
    const userId = selectedCharacter?.user_id!;
  const [sellInfo, setSellInfo] = useState<PokemonSellInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [selectedMethod, setSelectedMethod] = useState<'auction' | 'direct' | 'private' | null>(null);
  const [silvers, setSilvers] = useState<number>(500);
  const [golds, setGolds] = useState<number>(0);
  const [negotiable, setNegotiable] = useState<boolean>(false);
  const [trainer, setTrainer] = useState<string>('');

  useEffect(() => {
    if (isOpen && pokemonId) {
      loadSellInfo();
    }
  }, [isOpen, pokemonId]);

  const loadSellInfo = async () => {
    setLoading(true);
    try {
      const response = await getPokemonSellInfo({userId, pokemonId});
      if (response.success && response.data) {
        setSellInfo(response.data);
      } else {
        setMessage({ type: 'error', text: response.message || 'שגיאה בטעינת מידע' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'שגיאה בטעינת מידע הפוקימון' });
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!selectedMethod || !sellInfo) return;

    const confirmed = window.confirm(`האם אתה בטוח שברצונך למכור את ${getPokemonDisplayName(sellInfo.pokemon)}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await sellPokemon({
        userId,
        pokemonId,
        method: selectedMethod,
        silvers,
        golds: selectedMethod !== 'auction' ? golds : 0,
        negotiable: selectedMethod === 'direct' ? negotiable : false,
        trainer: selectedMethod === 'private' ? trainer : ''
      });

      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'שגיאה במכירת פוקימון' });
    } finally {
      setLoading(false);
    }
  };

  const renderMethodForm = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case 'auction':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-blue-600">מכירה פומבית</h4>
            <div>
              <label className="block text-sm font-medium mb-2">מחיר התחלתי:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={silvers}
                  onChange={(e) => setSilvers(Number(e.target.value))}
                  min={500}
                  max={1000000}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <img src={require('../../assets/images/icons/silver.png')} className="w-5 h-5" alt="כסף" />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                בין 500 ל-1,000,000 כסף
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p>הערות על מכירה פומבית:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>הערך יכול לעלות בגלל הצעות</li>
                <li>הפוקימון יימכר לאחר עד 48 שעות</li>
                <li>אם לא יהיו הצעות, הפוקימון יחזור הביתה</li>
              </ul>
            </div>
          </div>
        );

      case 'direct':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-green-600">מכירה ישירה</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">כסף:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={silvers}
                    onChange={(e) => setSilvers(Number(e.target.value))}
                    min={500}
                    max={1500000}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <img src={require('../../assets/images/icons/silver.png')} className="w-5 h-5" alt="כסף" />
                </div>
                <p className="text-xs text-gray-600 mt-1">500 - 1,500,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">זהב:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={golds}
                    onChange={(e) => setGolds(Number(e.target.value))}
                    min={0}
                    max={1000}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <img src={require('../../assets/images/icons/gold.png')} className="w-5 h-5" alt="זהב" />
                </div>
                <p className="text-xs text-gray-600 mt-1">0 - 1,000</p>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">מחיר ניתן למיקוח</span>
              </label>
              <p className="text-xs text-gray-600 mt-1">
                סמן כדי לקבל הצעות מיקוח על המחיר
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p>הפוקימון יחזור הביתה אם לא יימכר תוך יומיים</p>
            </div>
          </div>
        );

      case 'private':
        return (
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-purple-600">מכירה פרטית</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">כסף:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={silvers}
                    onChange={(e) => setSilvers(Number(e.target.value))}
                    min={500}
                    max={2000000}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <img src={require('../../assets/images/icons/silver.png')} className="w-5 h-5" alt="כסף" />
                </div>
                <p className="text-xs text-gray-600 mt-1">500 - 2,000,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">זהב:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={golds}
                    onChange={(e) => setGolds(Number(e.target.value))}
                    min={0}
                    max={1000}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <img src={require('../../assets/images/icons/gold.png')} className="w-5 h-5" alt="זהב" />
                </div>
                <p className="text-xs text-gray-600 mt-1">0 - 1,000</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">מאמן יעד:</label>
              <input
                type="text"
                value={trainer}
                onChange={(e) => setTrainer(e.target.value)}
                placeholder="שם המאמן שאליו אתה רוצה למכור"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
              <p>הפוקימון יהיה זמין רק למאמן שציינת</p>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {loading && !sellInfo ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <span>טוען מידע פוקימון...</span>
          </div>
        ) : sellInfo ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                מכירת פוקימון
              </h2>
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <img
                    src={getPokemonImageUrl(sellInfo.pokemon, '')}
                    alt={sellInfo.pokemon.naam}
                    className="w-20 h-20 mx-auto"
                  />
                </div>
                <h3 className="text-xl font-bold">
                  {getPokemonDisplayName(sellInfo.pokemon)}
                  {sellInfo.pokemon.shiny === 1 && ' ✨'}
                </h3>
                <p className="text-gray-600">רמה {sellInfo.pokemon.level}</p>
              </div>
            </div>

            {/* Sell limits info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm">
                <strong>מגבלת מכירות:</strong> {sellInfo.limits.current} / {sellInfo.limits.allowed} פוקימון למכירה
              </p>
            </div>

            {/* Method selection */}
            {!selectedMethod ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">בחר שיטת מכירה:</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedMethod('auction')}
                    className="w-full p-4 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-right"
                  >
                    <div className="font-bold text-blue-600">מכירה פומבית</div>
                    <div className="text-sm text-gray-600">מכירה עם הצעות למשך 48 שעות</div>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('direct')}
                    className="w-full p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors text-right"
                  >
                    <div className="font-bold text-green-600">מכירה ישירה</div>
                    <div className="text-sm text-gray-600">מחיר קבוע עם אפשרות מיקוח</div>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('private')}
                    className="w-full p-4 border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-right"
                  >
                    <div className="font-bold text-purple-600">מכירה פרטית</div>
                    <div className="text-sm text-gray-600">מכירה למאמן ספציפי</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">הגדרות מכירה</h3>
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← חזור לבחירת שיטה
                  </button>
                </div>
                {renderMethodForm()}
              </div>
            )}

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

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                ביטול
              </button>
              {selectedMethod && (
                <button
                  onClick={handleSell}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'מוכר...' : 'מכור פוקימון!'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-red-600">שגיאה בטעינת מידע הפוקימון</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              סגור
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonSellModal;