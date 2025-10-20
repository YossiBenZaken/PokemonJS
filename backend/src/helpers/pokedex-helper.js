import { query } from "../config/database.js";

/**
 * Update user's Pokedex entries for seen and owned Pokemon
 * @param {number} userId - User ID
 * @param {number} wildId - Pokemon wild_id to add to Pokedex
 * @param {number|null} oldId - Old Pokemon ID (for evolution, not used in current logic)
 * @param {string} type - Type of Pokedex update: 'ei', 'zien', 'vangen', 'buy', 'evo'
 */
export const updatePokedex = async (userId, wildId, oldId, type) => {
  try {
    // Get current Pokedex data
    const [user] = await query(
      "SELECT pok_seen, pok_possession FROM gebruikers WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Parse current Pokedex data (handle empty strings)
    const currentSeen = user.pok_seen ? user.pok_seen.split(',').filter(id => id !== '') : [];
    const currentOwned = user.pok_possession ? user.pok_possession.split(',').filter(id => id !== '') : [];

    // Convert to numbers for comparison
    const seenIds = currentSeen.map(id => parseInt(id)).filter(id => !isNaN(id));
    const ownedIds = currentOwned.map(id => parseInt(id)).filter(id => !isNaN(id));

    const wildIdNum = parseInt(wildId);
    let updateQueries = [];

    // Determine what to update based on type
    switch (type) {
      case 'ei': // Hatching egg - both seen and owned
        if (!seenIds.includes(wildIdNum)) {
          const newSeen = [...currentSeen, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_seen = '${newSeen}'`);
        }
        if (!ownedIds.includes(wildIdNum)) {
          const newOwned = [...currentOwned, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_possession = '${newOwned}'`);
        }
        break;

      case 'zien': // Just seen in battle/wild
        if (!seenIds.includes(wildIdNum)) {
          const newSeen = [...currentSeen, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_seen = '${newSeen}'`);
        }
        break;

      case 'vangen': // Caught Pokemon
        // Note: There's a bug in the original PHP - it updates pok_possession with pok_seen value
        // I'll fix it to use the correct owned list
        if (!ownedIds.includes(wildIdNum)) {
          const newOwned = [...currentOwned, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_possession = '${newOwned}'`);
        }
        break;

      case 'buy': // Bought Pokemon - both seen and owned
        if (!seenIds.includes(wildIdNum)) {
          const newSeen = [...currentSeen, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_seen = '${newSeen}'`);
        }
        if (!ownedIds.includes(wildIdNum)) {
          const newOwned = [...currentOwned, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_possession = '${newOwned}'`);
        }
        break;

      case 'evo': // Evolution - both seen and owned
        if (!seenIds.includes(wildIdNum)) {
          const newSeen = [...currentSeen, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_seen = '${newSeen}'`);
        }
        if (!ownedIds.includes(wildIdNum)) {
          const newOwned = [...currentOwned, wildId].filter(id => id !== '').join(',');
          updateQueries.push(`pok_possession = '${newOwned}'`);
        }
        break;

      default:
        console.warn(`Unknown Pokedex update type: ${type}`);
        return;
    }

    // Execute update if there are changes
    if (updateQueries.length > 0) {
      const updateQuery = `UPDATE gebruikers SET ${updateQueries.join(', ')} WHERE user_id = ? LIMIT 1`;
      await query(updateQuery, [userId]);
      
      console.log(`Pokedex updated for user ${userId}: Pokemon ${wildId} (${type})`);
    }

  } catch (error) {
    console.error('Error updating Pokedex:', error);
    throw error;
  }
};

/**
 * Get user's Pokedex statistics
 * @param {number} userId - User ID
 * @returns {Object} Pokedex statistics
 */
export const getPokedexStats = async (userId) => {
  try {
    const [user] = await query(
      "SELECT pok_seen, pok_possession FROM gebruikers WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const seenIds = user.pok_seen ? user.pok_seen.split(',').filter(id => id !== '' && !isNaN(parseInt(id))) : [];
    const ownedIds = user.pok_possession ? user.pok_possession.split(',').filter(id => id !== '' && !isNaN(parseInt(id))) : [];

    return {
      seen: seenIds.length,
      owned: ownedIds.length,
      seenList: seenIds.map(id => parseInt(id)),
      ownedList: ownedIds.map(id => parseInt(id))
    };
  } catch (error) {
    console.error('Error getting Pokedex stats:', error);
    throw error;
  }
};

/**
 * Check if user has seen or owned a specific Pokemon
 * @param {number} userId - User ID
 * @param {number} wildId - Pokemon wild_id to check
 * @returns {Object} Object with seen and owned status
 */
export const checkPokedexEntry = async (userId, wildId) => {
  try {
    const stats = await getPokedexStats(userId);
    
    return {
      seen: stats.seenList.includes(parseInt(wildId)),
      owned: stats.ownedList.includes(parseInt(wildId))
    };
  } catch (error) {
    console.error('Error checking Pokedex entry:', error);
    throw error;
  }
};