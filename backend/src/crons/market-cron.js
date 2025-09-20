import cron from 'node-cron';
import { query } from '../config/database.js';

// Market cron job - runs to refresh Pokemon eggs in marketplace
const marketCronJob = cron.schedule('0 */6 * * *', async () => { // Every 6 hours
  console.log('Running market cron job...');
  
  try {
    await refreshMarketEggs();
    await updateCronTime('markt');
    
    console.log('Market cron job completed successfully');
  } catch (error) {
    console.error('Error in market cron job:', error);
  }
}, {
  scheduled: false
});

// Function to refresh Pokemon eggs in marketplace
const refreshMarketEggs = async () => {
  try {
    // Get all unavailable Pokemon market items that need refreshing
    const marketItems = await query(`
      SELECT m.id, pw.wereld
      FROM markt m
      INNER JOIN pokemon_wild pw ON m.pokemonid = pw.wild_id
      WHERE m.soort = 'pokemon' AND m.beschikbaar = '0'
    `);

    console.log(`Found ${marketItems.length} market items to refresh`);

    for (const item of marketItems) {
      // Get a random Pokemon from the same world/region
      const [randomPokemon] = await query(`
        SELECT wild_id, naam, type1, zeldzaamheid 
        FROM pokemon_wild 
        WHERE wereld = ? AND evolutie = '1' AND aparece = 'sim' 
          AND egg = '1' AND zeldzaamheid <= 5 
        ORDER BY RAND() 
        LIMIT 1
      `, [item.wereld]);

      if (!randomPokemon) {
        console.log(`No suitable Pokemon found for world: ${item.wereld}`);
        continue;
      }

      // Calculate pricing and description based on rarity
      const priceData = calculatePriceAndDescription(randomPokemon);

      // Update the market item
      await query(`
        UPDATE markt SET 
          beschikbaar = '1',
          pokemonid = ?,
          naam = ?,
          silver = ?,
          gold = ?,
          omschrijving_nl = ?,
          omschrijving_en = ?,
          omschrijving_es = ?,
          omschrijving_de = ?,
          omschrijving_pl = ?,
          omschrijving_pt = ?
        WHERE id = ?
      `, [
        randomPokemon.wild_id,
        randomPokemon.naam,
        priceData.silverPrice,
        priceData.goldPrice,
        priceData.description,
        priceData.description,
        priceData.description,
        priceData.description,
        priceData.description,
        priceData.description,
        item.id
      ]);

      console.log(`Updated market item ${item.id} with ${randomPokemon.naam} (Rarity: ${randomPokemon.zeldzaamheid})`);
    }

  } catch (error) {
    console.error('Error in refreshMarketEggs:', error);
    throw error;
  }
};

// Function to calculate price and description based on Pokemon rarity
const calculatePriceAndDescription = (pokemon) => {
  const { zeldzaamheid, type1 } = pokemon;
  let silverPrice = 0;
  let goldPrice = 0;
  let description = '';

  switch (zeldzaamheid) {
    case 1: // Common
      silverPrice = Math.floor(Math.random() * (3500 - 1250 + 1)) + 1250; // 1250-3500
      goldPrice = 0;
      description = `ביצת פוקימון נפוצה. זהו פוקימון מסוג ${type1}.`;
      break;

    case 2: // Uncommon
      silverPrice = Math.floor(Math.random() * (7300 - 4000 + 1)) + 4000; // 4000-7300
      goldPrice = 0;
      description = `ביצת פוקימון לא נפוצה. נראה שזהו פוקימון מסוג ${type1}.`;
      break;

    case 3: // Rare
      silverPrice = Math.floor(Math.random() * (11000 - 7500 + 1)) + 7500; // 7500-11000
      goldPrice = 0;
      description = `ביצת פוקימון נדירה. יש סיכוי גבוה שזהו פוקימון מסוג ${type1}.`;
      break;

    default: // Legendary/Starter (4, 5, etc.)
      silverPrice = 0;
      goldPrice = Math.floor(Math.random() * (423 - 200 + 1)) + 200; // 200-423
      description = `ביצת פוקימון אגדי או אולי של פוקימון התחלתי? מדענים חושבים שזהו פוקימון מסוג ${type1}.`;
      break;
  }

  return {
    silverPrice,
    goldPrice,
    description
  };
};

// Function to update cron execution time
const updateCronTime = async (cronType) => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await query(
      "UPDATE cron SET tijd = ? WHERE soort = ?",
      [now, cronType]
    );
    
    console.log(`Updated ${cronType} cron execution time`);
  } catch (error) {
    console.error('Error updating cron time:', error);
    throw error;
  }
};

// Function to manually set all Pokemon market items as unavailable (for testing)
export const setAllPokemonUnavailable = async () => {
  try {
    const result = await query(
      "UPDATE markt SET beschikbaar = '0' WHERE soort = 'pokemon'"
    );
    
    console.log(`Set ${result.affectedRows} Pokemon market items as unavailable`);
    return { success: true, affected: result.affectedRows };
  } catch (error) {
    console.error('Error setting Pokemon unavailable:', error);
    throw error;
  }
};

// Function to start the market cron job
export const startMarketCron = () => {
  marketCronJob.start();
  console.log('Market cron job started - runs every 6 hours');
};

// Function to stop the market cron job
export const stopMarketCron = () => {
  marketCronJob.stop();
  console.log('Market cron job stopped');
};

// Export the cron job for manual execution
export const runMarketCronManually = async () => {
  console.log('Running market cron job manually...');
  
  try {
    await refreshMarketEggs();
    await updateCronTime('markt');
    
    console.log('Manual market cron job completed successfully');
    return { success: true, message: 'Cron executado com sucesso.' };
  } catch (error) {
    console.error('Error in manual market cron job:', error);
    return { success: false, message: 'Erro ao executar market cron job', error: error.message };
  }
};

export default marketCronJob;