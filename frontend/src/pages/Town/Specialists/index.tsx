import {
  ATTRIBUTE_NAMES,
  Nature,
  Pokemon,
  SERVICE_NAMES,
  User,
  calculateNatureCost,
  calculateNicknameCost,
  calculateShinyCost,
  changeNatureExact,
  changeNatureRandom,
  changeNatureTargeted,
  changeNickname,
  getSpecialistInfo,
  makeShiny
} from "../../../api/specialists.api";
import React, { useEffect, useState } from "react";

import { useGame } from "../../../contexts/GameContext";

const GOLD_ICON = require("../../../assets/images/icons/gold.png");
const SILVER_ICON = require("../../../assets/images/icons/silver.png");

const Specialists: React.FC = () => {
  const { selectedCharacter } = useGame();
  
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [teamPokemons, setTeamPokemons] = useState<Pokemon[]>([]);
  const [natures, setNatures] = useState<Nature[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [selectedPokemons, setSelectedPokemons] = useState<number[]>([]);
  const [nicknames, setNicknames] = useState<Record<number, string>>({});
  const [removeNames, setRemoveNames] = useState(false);
  const [changeType, setChangeType] = useState<'up' | 'down'>('up');
  const [selectedAttribute, setSelectedAttribute] = useState<'attack' | 'defense' | 'spatk' | 'spdef' | 'speed'>('attack');
  const [selectedNature, setSelectedNature] = useState<string>('');

  const loadSpecialistInfo = async () => {
    if (!selectedCharacter) return;
    
    setLoading(true);
    try {
      const response = await getSpecialistInfo(selectedCharacter.user_id);
      if (response.success && response.data) {
        setUserInfo(response.data.user);
        setTeamPokemons(response.data.teamPokemons);
        setNatures(response.data.natures);
        
        // Initialize nicknames with current names
        const initialNicknames: Record<number, string> = {};
        response.data.teamPokemons.forEach(pokemon => {
          initialNicknames[pokemon.id] = pokemon.roepnaam || '';
        });
        setNicknames(initialNicknames);
        
        if (response.data.natures.length > 0) {
          setSelectedNature(response.data.natures[0].karakter_naam);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בטעינת מידע המומחים' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialistInfo();
  }, [selectedCharacter?.user_id]);

  const handlePokemonSelect = (pokemonId: number, checked: boolean) => {
    if (checked) {
      setSelectedPokemons(prev => [...prev, pokemonId]);
    } else {
      setSelectedPokemons(prev => prev.filter(id => id !== pokemonId));
    }
  };

  const handleShinyService = async () => {
    if (!selectedCharacter || selectedPokemons.length === 0) return;

    setLoading(true);
    try {
      const response = await makeShiny(selectedCharacter.user_id, selectedPokemons);
      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });
      
      if (response.success) {
        setSelectedPokemons([]);
        loadSpecialistInfo();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בהפיכה לשיני' });
    } finally {
      setLoading(false);
    }
  };

  const handleNicknameService = async () => {
    if (!selectedCharacter || selectedPokemons.length === 0) return;

    const pokemonData: Record<number, string> = {};
    selectedPokemons.forEach(id => {
      pokemonData[id] = nicknames[id] || '';
    });

    setLoading(true);
    try {
      const response = await changeNickname(selectedCharacter.user_id, pokemonData, removeNames);
      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });
      
      if (response.success) {
        setSelectedPokemons([]);
        loadSpecialistInfo();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בשינוי שם' });
    } finally {
      setLoading(false);
    }
  };

  const handleNatureRandomService = async () => {
    if (!selectedCharacter || selectedPokemons.length === 0) return;

    setLoading(true);
    try {
      const response = await changeNatureRandom(selectedCharacter.user_id, selectedPokemons);
      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });
      
      if (response.success) {
        setSelectedPokemons([]);
        loadSpecialistInfo();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בשינוי אופי רנדומלי' });
    } finally {
      setLoading(false);
    }
  };

  const handleNatureTargetedService = async () => {
    if (!selectedCharacter || selectedPokemons.length === 0) return;

    setLoading(true);
    try {
      const response = await changeNatureTargeted(selectedCharacter.user_id, selectedPokemons, changeType, selectedAttribute);
      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });
      
      if (response.success) {
        setSelectedPokemons([]);
        loadSpecialistInfo();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בשינוי אופי מכוון' });
    } finally {
      setLoading(false);
    }
  };

  const handleNatureExactService = async () => {
    if (!selectedCharacter || selectedPokemons.length === 0 || !selectedNature) return;

    setLoading(true);
    try {
      const response = await changeNatureExact(selectedCharacter.user_id, selectedPokemons, selectedNature);
      setMessage({ 
        type: response.success ? 'success' : 'error', 
        text: response.message 
      });
      
      if (response.success) {
        setSelectedPokemons([]);
        loadSpecialistInfo();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'שגיאה בשינוי אופי מדויק' });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const renderPokemonRow = (pokemon: Pokemon, serviceType: string) => {
    const isSelected = selectedPokemons.includes(pokemon.id);
    const displayName = pokemon.roepnaam || pokemon.naam;
    
    // Calculate cost based on service
    let cost: number | string = 0;
    let costIcon = GOLD_ICON;
    let disabled = false;
    
    if (serviceType === 'shiny') {
      if (pokemon.ei === 1 || pokemon.shiny === 1) {
        cost = '--';
        disabled = true;
      } else {
        cost = calculateShinyCost(pokemon.zeldzaamheid, userInfo?.isPremium || false);
      }
    } else if (serviceType === 'nickname') {
      if (pokemon.ei === 1) {
        cost = '--';
        disabled = true;
      } else {
        const silverCost = calculateNicknameCost(pokemon.zeldzaamheid, pokemon.naam_changes, userInfo?.isPremium || false);
        cost = userInfo?.isPremium ? 'חינם' : silverCost;
        costIcon = SILVER_ICON;
      }
    } else if (serviceType === 'nature-random') {
      if (pokemon.ei === 1 || pokemon.humor_change > 2) {
        cost = '--';
        disabled = true;
      } else {
        cost = calculateNatureCost(pokemon.humor_change, userInfo?.isPremium || false, 'random');
      }
    } else if (serviceType === 'nature-targeted') {
      if (pokemon.ei === 1 || pokemon.humor_change > 2) {
        cost = '--';
        disabled = true;
      } else {
        cost = calculateNatureCost(pokemon.humor_change, userInfo?.isPremium || false, 'targeted');
      }
    } else if (serviceType === 'nature-exact') {
      if (pokemon.ei === 1 || pokemon.humor_change > 0) {
        cost = '--';
        disabled = true;
      } else {
        cost = calculateNatureCost(pokemon.humor_change, userInfo?.isPremium || false, 'exact');
      }
    }

    return (
      <tr key={pokemon.id} className={disabled ? 'opacity-50' : 'hover:bg-gray-50'}>
        <td className="px-4 py-2 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handlePokemonSelect(pokemon.id, e.target.checked)}
            disabled={disabled}
            className="rounded"
          />
        </td>
        <td className="px-4 py-2 text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
            <span className="text-xs">
              <img src={require(`../../../assets/images/${pokemon.shiny === 1 ? 'shiny': 'pokemon'}/icon/${pokemon.wild_id}.gif`)} alt={pokemon.naam} />
            </span>
          </div>
        </td>
        <td className="px-4 py-2 font-medium">{displayName}</td>
        <td className="px-4 py-2 text-center">{pokemon.level}</td>
        <td className="px-4 py-2 text-center">
          {typeof cost === 'number' ? (
            <div className="flex items-center justify-center">
              <img src={costIcon} alt="currency" className="w-4 h-4 mr-1" />
              <span>{formatNumber(cost)}</span>
            </div>
          ) : (
            <span>{cost}</span>
          )}
        </td>
        {serviceType === 'nickname' && (
          <td className="px-4 py-2">
            <input
              type="text"
              value={nicknames[pokemon.id] || ''}
              onChange={(e) => setNicknames(prev => ({ ...prev, [pokemon.id]: e.target.value }))}
              maxLength={12}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="שם חדש"
              disabled={disabled}
            />
          </td>
        )}
      </tr>
    );
  };

  const renderServiceTable = (serviceType: string, title: string, onSubmit: () => void, extraControls?: React.ReactNode) => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-bold mb-4 text-center text-blue-600">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <th className="px-4 py-2 text-center">#</th>
                <th className="px-4 py-2 text-center">פוקימון</th>
                <th className="px-4 py-2 text-center">שם</th>
                <th className="px-4 py-2 text-center">רמה</th>
                <th className="px-4 py-2 text-center">עלות</th>
                {serviceType === 'nickname' && <th className="px-4 py-2 text-center">שם</th>}
              </tr>
            </thead>
            <tbody>
              {teamPokemons.map(pokemon => renderPokemonRow(pokemon, serviceType))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {extraControls}
            {serviceType === 'nickname' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={removeNames}
                  onChange={(e) => setRemoveNames(e.target.checked)}
                  className="mr-2"
                />
                החזר לשם ברירת מחדל
              </label>
            )}
          </div>
          <button
            onClick={onSubmit}
            disabled={loading || selectedPokemons.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            בצע שירות
          </button>
        </div>
      </div>
    );
  };

  if (!userInfo) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">
            {loading ? 'טוען מידע...' : 'שגיאה בטעינת מידע המומחים'}
          </div>
        </div>
      </div>
    );
  }

  if (userInfo.rank < 5) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-6 rounded text-center">
          <h2 className="text-xl font-bold mb-2">רנק לא מספיק</h2>
          <p>רנק מינימלי לשימוש במומחים: 5 - First Coach. המשך לעלות ברמה כדי לפתוח!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">מומחי פוקימון</h1>
        <p className="text-center">שירותים מיוחדים לפוקימונים שלך!</p>
        <div className="flex justify-center items-center mt-4 gap-6">
          <div className="flex items-center">
            <img src={SILVER_ICON} alt="Silver" className="w-5 h-5 mr-2" />
            <span className="text-lg">{formatNumber(userInfo.silver)}</span>
          </div>
          <div className="flex items-center">
            <img src={GOLD_ICON} alt="Gold" className="w-5 h-5 mr-2" />
            <span className="text-lg">{formatNumber(userInfo.gold)}</span>
          </div>
          {userInfo.isPremium && (
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
              פרימיום
            </span>
          )}
        </div>
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

      {/* Service Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shiny Specialist */}
        {renderServiceTable('shiny', SERVICE_NAMES.shiny, handleShinyService)}

        {/* Nickname Specialist */}
        {renderServiceTable('nickname', SERVICE_NAMES.nickname, handleNicknameService)}

        {/* Nature Random Specialist */}
        {renderServiceTable('nature-random', SERVICE_NAMES.nature_random, handleNatureRandomService)}

        {/* Nature Targeted Specialist */}
        {renderServiceTable(
          'nature-targeted', 
          SERVICE_NAMES.nature_targeted, 
          handleNatureTargetedService,
          <div className="flex items-center gap-4">
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as 'up' | 'down')}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="up">הגדל</option>
              <option value="down">הקטן</option>
            </select>
            <select
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              {Object.entries(ATTRIBUTE_NAMES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Nature Exact Specialist - Full Width */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-bold mb-4 text-center text-blue-600">{SERVICE_NAMES.nature_exact}</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <th className="px-4 py-2 text-center">#</th>
                <th className="px-4 py-2 text-center">פוקימון</th>
                <th className="px-4 py-2 text-center">שם</th>
                <th className="px-4 py-2 text-center">רמה</th>
                <th className="px-4 py-2 text-center">עלות</th>
              </tr>
            </thead>
            <tbody>
              {teamPokemons.map(pokemon => renderPokemonRow(pokemon, 'nature-exact'))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <select
            value={selectedNature}
            onChange={(e) => setSelectedNature(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            {natures.map(nature => (
              <option key={nature.karakter_naam} value={nature.karakter_naam}>
                {nature.karakter_naam.charAt(0).toUpperCase() + nature.karakter_naam.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={handleNatureExactService}
            disabled={loading || selectedPokemons.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            בצע שירות
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600 p-3 bg-gray-50 rounded">
          <p>שירות יקר יותר, אבל מתאים יותר - אתה יכול לבחור איזה אופי הפוקימון שלך יהיה.</p>
          <p className="font-semibold">זכור שהפוקימון לא יכול לעבור שינוי אופי קודם, ובנוסף לא ניתן יותר לשנות אופי אחרי הבחירה.</p>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
              <span className="text-lg">מעבד...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specialists;