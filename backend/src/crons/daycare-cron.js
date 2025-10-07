import cron from 'node-cron';
import { query } from '../config/database.js';

// Daycare cron job - runs every hour (adjust as needed)
const daycareCronJob = cron.schedule('0 0,12 * * *', async () => {
  console.log('Running daycare cron job...');
  
  try {
    // Level up Pokemon in daycare
    await levelUpDaycarePokemons();
    
    // Handle egg generation
    await handleEggGeneration();
    
    // Update cron execution time
    await updateCronTime();
    
    console.log('Daycare cron job completed successfully');
  } catch (error) {
    console.error('Error in daycare cron job:', error);
  }
}, {
  scheduled: false // Don't start automatically
});

// Function to level up Pokemon in daycare
const levelUpDaycarePokemons = async () => {
  try {
    const daycarePokemons = await query(
      "SELECT pokemonid, level, levelup FROM daycare WHERE ei = '0' AND levelup < 15 ORDER BY id"
    );

    for (const pokemon of daycarePokemons) {
      const totalLevel = pokemon.level + pokemon.levelup;
      
      if (totalLevel < 100) {
        // Random level up (0 or 1)
        const levelUpAmount = Math.floor(Math.random() * 2); // 0 or 1
        
        await query(
          "UPDATE daycare SET levelup = levelup + ? WHERE pokemonid = ?",
          [levelUpAmount, pokemon.pokemonid]
        );
      }
    }
    
    console.log(`Processed ${daycarePokemons.length} daycare Pokemon for level ups`);
  } catch (error) {
    console.error('Error in levelUpDaycarePokemons:', error);
    throw error;
  }
};

// Function to handle egg generation
const handleEggGeneration = async () => {
  try {
    // Get users with Pokemon in daycare grouped by user_id
    const users = await query(
      "SELECT user_id, COUNT(user_id) AS owner FROM daycare WHERE ei = '0' GROUP BY user_id"
    );

    for (const user of users) {
      const randomChance = Math.floor(Math.random() * 4) + 1; // 1-4
      
      // Get user premium status
      const [userInfo] = await query(
        "SELECT premiumaccount FROM gebruikers WHERE user_id = ?",
        [user.user_id]
      );

      if (!userInfo) continue;

      const isPremium = userInfo.premiumaccount > Math.floor(Date.now() / 1000);

      if (!isPremium) {
        // Delete egg for non-premium users and notify
        await query(
          "DELETE FROM daycare WHERE user_id = ? AND ei = '1'",
          [user.user_id]
        );
        
        await query(`
          INSERT INTO gebeurtenis (datum, ontvanger_id, bericht, gelezen) 
          VALUES (NOW(), ?, 'אתה לא פרימיום! הביצה שלך אבדה בגן.', '0')
        `, [user.user_id]);
        
        continue;
      }

      // Only proceed if random chance is 1 (25% chance) and user has exactly 2 Pokemon
      if (randomChance === 1 && user.owner === 2) {
        await generateEgg(user.user_id);
      }
    }
    
    console.log(`Processed ${users.length} users for egg generation`);
  } catch (error) {
    console.error('Error in handleEggGeneration:', error);
    throw error;
  }
};

// Function to generate an egg
const generateEgg = async (userId) => {
  try {
    // Get the two Pokemon in daycare for this user
    const daycarePokemons = await query(
      "SELECT pokemonid, user_id, naam FROM daycare WHERE user_id = ? AND ei = '0' ORDER BY id",
      [userId]
    );

    if (daycarePokemons.length !== 2) return;

    const pokemon1 = daycarePokemons[0];
    const pokemon2 = daycarePokemons[1];

    // Get shiny status for both Pokemon
    const [shinyStatus1] = await query(
      "SELECT shiny FROM pokemon_speler WHERE id = ?",
      [pokemon1.pokemonid]
    );
    
    const [shinyStatus2] = await query(
      "SELECT shiny FROM pokemon_speler WHERE id = ?",
      [pokemon2.pokemonid]
    );

    // Check if both Pokemon are shiny
    const isShiny = (shinyStatus1.shiny == 1 && shinyStatus2.shiny == 1) ? 1 : 0;

    // Check breeding compatibility
    let canBreed = false;
    let eggPokemonName = '';

    if (pokemon1.naam === pokemon2.naam || 
        pokemon1.naam === 'Ditto' || 
        pokemon2.naam === 'Ditto') {
      
      canBreed = true;
      eggPokemonName = pokemon1.naam === 'Ditto' ? pokemon2.naam : pokemon1.naam;
    }

    if (!canBreed) return;

    // Check if Pokemon is not rare and not Shadow type
    const [pokemonData] = await query(
      "SELECT wild_id, zeldzaamheid, type1 FROM pokemon_wild WHERE naam = ?",
      [eggPokemonName]
    );

    if (!pokemonData || pokemonData.zeldzaamheid === 3 || pokemonData.type1 === 'Shadow') {
      return;
    }

    // Find the base evolution form
    let wildId = pokemonData.wild_id;
    
    while (true) {
      const evolution = await query(
        "SELECT wild_id FROM levelen WHERE nieuw_id = ? AND wat = 'evo'",
        [wildId]
      );
      
      if (evolution.length === 0) {
        break;
      } else {
        const newWildId = evolution[0].wild_id;
        if (wildId !== newWildId) {
          wildId = newWildId;
        } else {
          break;
        }
      }
    }

    // Get the base form Pokemon name
    const [basePokemon] = await query(
      "SELECT naam FROM pokemon_wild WHERE wild_id = ?",
      [wildId]
    );

    if (!basePokemon) return;

    // Create the egg
    await query(`
      INSERT INTO daycare (level, levelup, user_id, naam, ei) 
      VALUES (5, ?, ?, ?, '1')
    `, [isShiny, userId, basePokemon.naam]);

    console.log(`Generated egg for user ${userId}: ${basePokemon.naam} (Shiny: ${isShiny})`);

  } catch (error) {
    console.error('Error in generateEgg:', error);
    throw error;
  }
};

// Function to update cron execution time
const updateCronTime = async () => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await query(
      "UPDATE cron SET tijd = ? WHERE soort = 'daycare'",
      [now]
    );
    
    console.log('Updated cron execution time');
  } catch (error) {
    console.error('Error updating cron time:', error);
    throw error;
  }
};

// Function to start the cron job
export const startDaycareCron = () => {
  daycareCronJob.start();
  console.log('Daycare cron job started - runs every hour');
};

// Function to stop the cron job
export const stopDaycareCron = () => {
  daycareCronJob.stop();
  console.log('Daycare cron job stopped');
};

// Export the cron job for manual execution if needed
export const runDaycareCronManually = async () => {
  console.log('Running daycare cron job manually...');
  
  try {
    await levelUpDaycarePokemons();
    await handleEggGeneration();
    await updateCronTime();
    
    console.log('Manual daycare cron job completed successfully');
    return { success: true, message: 'Cron executado com sucesso.' };
  } catch (error) {
    console.error('Error in manual daycare cron job:', error);
    return { success: false, message: 'Erro ao executar cron job', error: error.message };
  }
};

export default daycareCronJob;