import React, { useEffect, useState } from 'react';
import { buyHouse, getHouseStatus } from '../../api/houses.api';

import { useGame } from '../../contexts/GameContext';

interface House {
  afkorting: string;
  kosten: number;
  link: string;
  omschrijving_en: string;
  isOwned: boolean;
  canAfford: boolean;
  isDisabled: boolean;
}

interface HouseShopProps {
  onHousePurchased?: () => void;
}

export const HouseShop: React.FC<HouseShopProps> = ({ onHousePurchased }) => {
  const { selectedCharacter, setSelectedCharacter } = useGame();
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouse, setCurrentHouse] = useState<string>('');
  const [silver, setSilver] = useState<number>(0);
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if(selectedCharacter) {
      loadHouseStatus();
    }
  }, [selectedCharacter]);

  const loadHouseStatus = async () => {
    if (!selectedCharacter?.user_id) return;
    
    try {
      setIsLoading(true);
      const response = await getHouseStatus(selectedCharacter.user_id.toString());
      if (response.success) {
        setHouses(response.data.houses);
        setCurrentHouse(response.data.currentHouse);
        setSilver(response.data.silver);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'שגיאה בטעינת רשימת הבתים'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyHouse = async () => {
    if (!selectedHouse || !selectedCharacter?.user_id) return;

    try {
      setIsPurchasing(true);
      setMessage(null);
      
      const response = await buyHouse(selectedHouse, selectedCharacter.user_id.toString());
      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message
        });
        setSilver(response.data.remainingSilver);
        setSelectedCharacter({...selectedCharacter, silver: response.data.remainingSilver});
        setCurrentHouse(response.data.newHouse);
        setSelectedHouse('');
        onHousePurchased?.();
        // רענון רשימת הבתים
        await loadHouseStatus();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'שגיאה בקניית הבית'
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const getHouseName = (afkorting: string) => {
    const names: { [key: string]: string } = {
      'doos': 'קופסה',
      'shuis': 'בית קטן',
      'nhuis': 'בית נורמלי',
      'villa': 'וילה'
    };
    return names[afkorting] || afkorting;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('he-IL');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>טוען רשימת בתים...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h2>חנות בתים</h2>
      <p>הבית הנוכחי שלך: <strong>{getHouseName(currentHouse)}</strong></p>
      <p>כסף זמין: <strong>{formatNumber(silver)} כסף</strong></p>

      {message && (
        <div
          style={{
            padding: '1rem',
            margin: '1rem 0',
            borderRadius: '4px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>#</th>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>בית</th>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>מחיר</th>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>תיאור</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house, index) => (
              <tr key={house.afkorting}>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>
                  <input
                    type="radio"
                    name="house"
                    value={house.afkorting}
                    checked={selectedHouse === house.afkorting}
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    disabled={house.isDisabled}
                  />
                </td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center', height: '80px' }}>
                  <img
                    src={require(`../../assets/${house.link}`)}
                    alt={getHouseName(house.afkorting)}
                    style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'contain' }}
                  />
                </td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>
                  <img
                    src={require('../../assets/images/icons/silver.png')}
                    alt="Silver"
                    style={{ width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }}
                  />
                  {formatNumber(house.kosten)}
                </td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                  <div 
                    dangerouslySetInnerHTML={{ __html: house.omschrijving_en }}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  {house.isOwned && (
                    <span style={{ color: '#28a745', fontWeight: 'bold', marginRight: '8px' }}>
                      (בבעלותך)
                    </span>
                  )}
                  {!house.canAfford && !house.isOwned && (
                    <span style={{ color: '#dc3545', fontWeight: 'bold', marginRight: '8px' }}>
                      (אין מספיק כסף)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={handleBuyHouse}
          disabled={!selectedHouse || isPurchasing || houses.find(h => h.afkorting === selectedHouse)?.isDisabled}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            backgroundColor: selectedHouse && !isPurchasing ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedHouse && !isPurchasing ? 'pointer' : 'not-allowed',
          }}
        >
          {isPurchasing ? 'קונה...' : 'קנה!'}
        </button>
      </div>
    </div>
  );
};
