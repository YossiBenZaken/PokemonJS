import { query } from "../config/database.js";

export const Auth = async (socket) => {
  socket.on("getUserInfo", async (userId, callback) => {
    try {
      const [user] = await query(
        "SELECT * FROM `gebruikers` WHERE `user_id` = ?",
        [userId]
      );
      const [userItem] = await query(
        "SELECT * FROM `gebruikers_item` WHERE `user_id` = ?",
        [userId]
      );
      const [account] = await query(
        "SELECT gold FROM `rekeningen` WHERE `acc_id` = ?",
        [user.acc_id]
      );
      const eventsCount = (
        await query(
          "SELECT `id` FROM `gebeurtenis` WHERE `ontvanger_id`=? AND `gelezen`='0'",
          [userId]
        )
      ).length;

      const mailsCount = (
        await query(
          "SELECT * FROM `conversas` WHERE `trainer_2_hidden`='0' AND `id` = ANY (SELECT DISTINCT (`conversa`) FROM `conversas_messages` WHERE `reciever`=? AND `seen`='0')",
          [userId]
        )
      ).length;
      const officialCount = (
        await query(
          "SELECT `id` FROM `official_message` WHERE `hidden`='0' AND `id` NOT IN (SELECT `id_msg` FROM `official_message_read` WHERE `id_user`=?)",
          [userId]
        )
      ).length;
      callback({
        success: true,
        data: {
          user: {
            ...user,
            items: userItem,
            ...account,
          },
          eventsCount,
          unreadMessage: mailsCount + officialCount,
        },
      });
    } catch (err) {
      console.error(err);
      callback({ success: false, error: err.message });
    }
  });

  socket.on("getMyPokemons", async(userId,callback) => {
    try {
      const myPokemon = await query(
        "SELECT `pw`.`naam`,`pw`.`type1`,`pw`.`type2`,`pw`.`zeldzaamheid`,`pw`.`groei`,`pw`.`aanval_1`,`ps`.`humor_change`,`pw`.`aanval_2`,`pw`.`aanval_3`,`pw`.`aanval_4`,`ps`.* FROM `pokemon_wild` AS `pw` INNER JOIN `pokemon_speler` AS `ps` ON `ps`.`wild_id`=`pw`.`wild_id` WHERE `ps`.`user_id`=? AND `ps`.`opzak`='ja' ORDER BY `ps`.`opzak_nummer` ASC",
        [userId]
      );
      callback({
        success: true,
        data: {
          myPokemon,
          in_hand: myPokemon.length,
        },
      });
    } catch (error) {
      console.error("שגיאה בקבלת פוקימון:", error);
      callback({
        success: false,
        message: "שגיאה פנימית בשרת",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  })
};
