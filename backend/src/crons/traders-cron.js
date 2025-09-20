import cron from 'node-cron';
import { query } from '../config/database.js';

// Traders cron job - runs to refresh empty trader offers
const tradersCronJob = cron.schedule('0 */4 * * *', async () => { // Every 4 hours
  console.log('Running traders cron job...');
  
  try {
    await refreshTraderOffers();
    await updateCronTime('trader');
    
    console.log('Traders cron job completed successfully');
  } catch (error) {
    console.error('Error in traders cron job:', error);
  }
}, {
  scheduled: false
});

// Function to refresh trader offers
const refreshTraderOffers = async () => {
  try {
    // Get all traders
    const traders = await query("SELECT * FROM traders");
    
    console.log(`Processing ${traders.length} traders for offer refresh`);

    for (const trader of traders) {
      // Check if trader has no active offer (empty wil field)
      if (!trader.wil || trader.wil === '') {
        await assignRandomOffer(trader);
      } else {
        console.log(`Trader ${trader.eigenaar} already has an active offer`);
      }
    }

  } catch (error) {
    console.error('Error in refreshTraderOffers:', error);
    throw error;
  }
};

// Function to assign a random trade offer to a trader
const assignRandomOffer = async (trader) => {
  try {
    // Get a random Pokemon that the trader will offer
    const [offerPokemon] = await query(`
      SELECT naam, zeldzaamheid 
      FROM pokemon_wild 
      WHERE evolutie = '1' 
        AND zeldzaamheid <= 5 
        AND aparece = 'sim' 
        AND comerciantes = 'sim' 
      ORDER BY RAND() 
      LIMIT 1
    `);

    if (!offerPokemon) {
      console.log(`No suitable Pokemon found for trader ${trader.eigenaar} to offer`);
      return;
    }

    // Get a random Pokemon of the same rarity that the trader will want
    const [wantPokemon] = await query(`
      SELECT naam 
      FROM pokemon_wild 
      WHERE zeldzaamheid = ? 
        AND naam != ? 
        AND evolutie = '1' 
        AND aparece = 'sim' 
        AND comerciantes = 'sim' 
      ORDER BY RAND() 
      LIMIT 1
    `, [offerPokemon.zeldzaamheid, offerPokemon.naam]);

    if (!wantPokemon) {
      console.log(`No suitable Pokemon found for trader ${trader.eigenaar} to want (rarity: ${offerPokemon.zeldzaamheid})`);
      return;
    }

    // Update the trader with the new offer
    await query(
      "UPDATE traders SET naam = ?, wil = ? WHERE eigenaar = ? LIMIT 1",
      [offerPokemon.naam, wantPokemon.naam, trader.eigenaar]
    );

    console.log(`Updated trader ${trader.eigenaar}: Offers ${offerPokemon.naam} (rarity ${offerPokemon.zeldzaamheid}) for ${wantPokemon.naam}`);

  } catch (error) {
    console.error(`Error assigning offer to trader ${trader.eigenaar}:`, error);
    throw error;
  }
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

// Function to start the traders cron job
export const startTradersCron = () => {
  tradersCronJob.start();
  console.log('Traders cron job started - runs every 4 hours');
};

// Function to stop the traders cron job
export const stopTradersCron = () => {
  tradersCronJob.stop();
  console.log('Traders cron job stopped');
};

// Export the cron job for manual execution
export const runTradersCronManually = async () => {
  console.log('Running traders cron job manually...');
  
  try {
    await refreshTraderOffers();
    await updateCronTime('trader');
    
    console.log('Manual traders cron job completed successfully');
    return { success: true, message: 'Cron de traders executado com sucesso.' };
  } catch (error) {
    console.error('Error in manual traders cron job:', error);
    return { success: false, message: 'Erro ao executar cron job de traders', error: error.message };
  }
};

// Function to force refresh all traders (clear all offers)
export const forceRefreshAllTraders = async () => {
  try {
    // Clear all current offers
    await query("UPDATE traders SET wil = '', naam = ''");
    
    // Assign new offers to all traders
    const traders = await query("SELECT * FROM traders");
    
    for (const trader of traders) {
      await assignRandomOffer(trader);
    }
    
    console.log('Force refresh completed for all traders');
    return { success: true, message: 'Todos os traders foram atualizados com novas ofertas' };
  } catch (error) {
    console.error('Error in force refresh:', error);
    return { success: false, message: 'Erro ao atualizar traders', error: error.message };
  }
};

export default tradersCronJob;