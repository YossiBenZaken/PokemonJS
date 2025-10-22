import { getBattleInfo } from "../controllers/battle-controller.js";
import { query } from "../config/database.js";

export const Battle = async(socket) => {
    socket.on("InitBattle", async (attack_log_id, callback) => {
        const {computer_info, pokemon_info, aanval_log, enemyPokemons} = await getBattleInfo(attack_log_id);
        callback({computer_info,pokemon_info,aanval_log,enemyPokemons})
    })
    socket.on('currentBattle', async(callback) => {
        const userId = socket.user?.user_id;
        const [logId] = await query(
          "SELECT `id` FROM `aanval_log` WHERE `user_id`=?",
          [userId]
        );
        if (logId) {
          return callback({
            success: true,
            attackLogId: logId.id,
          });
        } else {
          await query(
            "UPDATE `gebruikers` SET `page`='attack_start' WHERE `user_id`=?",
            [userId]
          );
          return callback({
            success: false,
          });
        }
    })
}