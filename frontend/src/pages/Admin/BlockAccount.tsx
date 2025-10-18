import {
  BannedAccount,
  banAccount,
  formatBanDate,
  getBannedAccounts,
  unbanAccount
} from "../../api/admin.api";
import React, { useEffect, useState } from "react";

import { useGame } from "../../contexts/GameContext";

const BlockAccount: React.FC = () => {
  const { selectedCharacter } = useGame();
  
  const [bannedAccounts, setBannedAccounts] = useState<BannedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [banUntil, setBanUntil] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);

  useEffect(() => {
    loadBannedAccounts();
  }, [selectedCharacter?.admin]);

  const loadBannedAccounts = async () => {
    if (!selectedCharacter) return;
    
    setLoading(true);
    try {
      const response = await getBannedAccounts();
      if (response.success && response.data) {
        setBannedAccounts(response.data);
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'שגיאה בטעינת חשבונות חסומים' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCharacter) return;

    const confirmed = window.confirm(`האם אתה בטוח שברצונך לחסום את ${email}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await banAccount({
        email: email.trim(),
        reason: reason.trim(),
        banUntil: isPermanent ? undefined : banUntil
      });

      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setEmail('');
        setReason('');
        setBanUntil('');
        setIsPermanent(false);
        loadBannedAccounts();
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'שגיאה בחסימת החשבון' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (accountEmail: string) => {
    if (!selectedCharacter) return;

    const confirmed = window.confirm(`האם אתה בטוח שברצונך לשחרר את ${accountEmail}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await unbanAccount({
        email: accountEmail
      });

      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        loadBannedAccounts();
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'שגיאה בשחרור החשבון' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCharacter) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-gray-500">בחר דמות עם הרשאות מנהל</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">ניהול חסימות חשבונות</h1>
        <p className="text-center">פאנל מנהל לחסימה ושחרור חשבונות</p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg border-r-4 ${
          message.type === 'success' 
            ? 'bg-green-100 border-green-500 text-green-700' 
            : 'bg-red-100 border-red-500 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Ban Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">חסימת חשבון</h2>
        <form onSubmit={handleBan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              כתובת אימייל של החשבון:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              סיבת החסימה:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              placeholder="הסיבה לחסימה"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">חסימה לצמיתות</span>
            </label>
          </div>

          {!isPermanent && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                תאריך סיום החסימה:
              </label>
              <input
                type="date"
                value={banUntil}
                onChange={(e) => setBanUntil(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                min={new Date().toISOString().split('T')[0]}
                required={!isPermanent}
              />
              <p className="text-xs text-gray-600 mt-1">
                השאר ריק או סמן חסימה לצמיתות עבור חסימה קבועה
              </p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'מעבד...' : 'חסום חשבון'}
            </button>
          </div>
        </form>
      </div>

      {/* Banned Accounts Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          רשימת חשבונות חסומים ({bannedAccounts.length})
        </h2>
        
        {loading && bannedAccounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <span>טוען חשבונות...</span>
          </div>
        ) : bannedAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">אין חשבונות חסומים</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <th className="px-4 py-3 text-right">חשבון</th>
                  <th className="px-4 py-3 text-right">חסום עד</th>
                  <th className="px-4 py-3 text-right">סיבה</th>
                  <th className="px-4 py-3 text-center">פעולה</th>
                </tr>
              </thead>
              <tbody>
                {bannedAccounts.map((account, index) => (
                  <tr 
                    key={account.accId}
                    className={`border-b hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold">{account.username}</div>
                        <div className="text-sm text-gray-600">{account.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${
                        account.bannedUntil 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formatBanDate(account.bannedUntil)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{account.reason}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleUnban(account.email)}
                        disabled={loading}
                        className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
                      >
                        שחרר
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 ml-3"></div>
              <span className="text-lg">מעבד...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockAccount;