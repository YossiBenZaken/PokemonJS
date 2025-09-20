import {
  ClanInfo,
  Transaction,
  UserBankInfo,
  getBankInfo,
  getTransactionHistory,
  transferToClan,
  transferToPlayer
} from "../../../api/bank.api";
import React, { useEffect, useState } from "react";

import GOLD_ICON from "../../../assets/images/icons/gold.png";
import SILVER_ICON from "../../../assets/images/icons/silver.png";
import { useGame } from "../../../contexts/GameContext";

const Bank: React.FC = () => {
  const { selectedCharacter } = useGame();
  
  const [userInfo, setUserInfo] = useState<UserBankInfo | null>(null);
  const [clanInfo, setClanInfo] = useState<ClanInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Transfer form states
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'silver' | 'gold'>('silver');
  const [clanAmount, setClanAmount] = useState('');
  const [clanCurrency, setClanCurrency] = useState<'silver' | 'gold'>('silver');

  const loadBankInfo = async () => {
    if (!selectedCharacter) return;
    
    setLoading(true);
    try {
      const response = await getBankInfo(selectedCharacter.user_id);
      if (response.success && response.data) {
        setUserInfo(response.data.user);
        setClanInfo(response.data.clan);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בטעינת פרטי הבנק' });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!selectedCharacter) return;
    
    try {
      const response = await getTransactionHistory(selectedCharacter.user_id, 1, 10);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('שגיאה בטעינת עסקאות:', error);
    }
  };

  useEffect(() => {
    loadBankInfo();
    loadTransactions();
  }, [selectedCharacter]);

  const handleTransferToPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCharacter || !receiver || !amount) return;

    const confirmed = window.confirm('האם אתה באמת רוצה לבצע את ההעברה הזו?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await transferToPlayer({
        userId: selectedCharacter.user_id,
        receiver: receiver.trim(),
        amount: parseInt(amount),
        currency
      });

      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });

      if (response.success) {
        setReceiver('');
        setAmount('');
        loadBankInfo();
        loadTransactions();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בביצוע העברה' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferToClan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCharacter || !clanAmount) return;

    const confirmed = window.confirm('האם אתה באמת רוצה לבצע את ההעברה הזו לקלאן שלך?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await transferToClan({
        userId: selectedCharacter.user_id,
        amount: parseInt(clanAmount),
        currency: clanCurrency
      });

      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });

      if (response.success) {
        setClanAmount('');
        loadBankInfo();
        loadTransactions();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בהעברה לקלאן' });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">טוען פרטי בנק...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">בנק פוקימון</h1>
        <p className="text-center text-sm">
        כאן ניתן לבצע העברות של <strong>כסף</strong> או <strong>זהב</strong> עבור  <strong>מאמנים אחרים</strong>!<br/>
        לפחות 10 כסף ו <strong>דרגה מינימלית</strong> לבצע העברות זהב הוא <strong>8 - דו-קרב חדש</strong>!
        </p>
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

      {/* User Balance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">יתרת מלאי</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <img src={SILVER_ICON} alt="Silver" className="w-6 h-6 mr-2" />
            <span className="text-2xl font-bold">{formatNumber(userInfo.silver)}</span>
            <span className="ml-2 text-gray-600">כסף</span>
          </div>
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <img src={GOLD_ICON} alt="Gold" className="w-6 h-6 mr-2" />
            <span className="text-2xl font-bold">{formatNumber(userInfo.gold)}</span>
            <span className="ml-2 text-gray-600">זהב</span>
          </div>
        </div>
        <div className="text-center mt-4 text-sm text-gray-600">
          דרגה: {userInfo.rank} | שם משתמש: {userInfo.username}
        </div>
      </div>

      {/* Transfer to Player */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">העברות שחקנים</h2>
        <form onSubmit={handleTransferToPlayer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
              מְאַמֵן:
              </label>
              <input
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="שם המאמן"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
              עֵרֶך:
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="סְכוּם"
                min="10"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-center space-x-8">
            <label className="flex items-center">
              <input
                type="radio"
                value="silver"
                checked={currency === 'silver'}
                onChange={(e) => setCurrency(e.target.value as 'silver' | 'gold')}
                className="mr-2"
              />
              <img src={SILVER_ICON} alt="Silver" className="w-4 h-4 mr-1" />
              כסף
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="gold"
                checked={currency === 'gold'}
                onChange={(e) => setCurrency(e.target.value as 'silver' | 'gold')}
                className="mr-2"
                disabled={userInfo.rank < 8}
              />
              <img src={GOLD_ICON} alt="Gold" className="w-4 h-4 mr-1" />
              זהב {userInfo.rank < 8 && <span className="text-red-500 text-xs ml-1">(דירוג לא מספיק)</span>}
            </label>
          </div>

          <div className="border-t pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              לְהַעֲבִיר
            </button>
          </div>
        </form>
      </div>

      {/* Clan Section */}
      {userInfo.clan && clanInfo && (
        <>
          {/* Clan Balance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Saldo do Clã</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg">
                <img src={SILVER_ICON} alt="Silver" className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{formatNumber(clanInfo.silvers)}</span>
                <span className="ml-2 text-gray-600">כסף</span>
              </div>
              <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg">
                <img src={GOLD_ICON} alt="Gold" className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{formatNumber(clanInfo.golds)}</span>
                <span className="ml-2 text-gray-600">זהב</span>
              </div>
            </div>
          </div>

          {/* Transfer to Clan */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">העברה לקלאן</h2>
            <form onSubmit={handleTransferToClan} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  ערך:
                </label>
                <input
                  type="number"
                  value={clanAmount}
                  onChange={(e) => setClanAmount(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="כמות"
                  min="10"
                  required
                />
              </div>
              
              <div className="flex justify-center space-x-8">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="silver"
                    checked={clanCurrency === 'silver'}
                    onChange={(e) => setClanCurrency(e.target.value as 'silver' | 'gold')}
                    className="mr-2"
                  />
                  <img src={SILVER_ICON} alt="Silver" className="w-4 h-4 mr-1" />
                  כסף
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="gold"
                    checked={clanCurrency === 'gold'}
                    onChange={(e) => setClanCurrency(e.target.value as 'silver' | 'gold')}
                    className="mr-2"
                    disabled={userInfo.rank < 8}
                  />
                  <img src={GOLD_ICON} alt="Gold" className="w-4 h-4 mr-1" />
                  זהב {userInfo.rank < 8 && <span className="text-red-500 text-xs ml-1">(דירוג לא מספיק)</span>}
                </label>
              </div>

              <div className="border-t pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  העברה לקלאן
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">עסקאות אחרונות</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">זמן עסקה</th>
                  <th className="px-4 py-2 text-left">שׁוֹלֵחַ</th>
                  <th className="px-4 py-2 text-left">מְקַבֵּל</th>
                  <th className="px-4 py-2 text-left">ערך</th>
                  <th className="px-4 py-2 text-left">סוּג</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {transaction.sender}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {transaction.reciever}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center">
                        <img 
                          src={transaction.what === 'silver' ? SILVER_ICON : GOLD_ICON} 
                          alt={transaction.what} 
                          className="w-4 h-4 mr-1" 
                        />
                        {formatNumber(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.what === 'silver' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.what.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
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

export default Bank;