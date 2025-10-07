import cron from "node-cron";
import { query } from "../config/database.js";

const weeklyCronJob = cron.schedule("0 0 * * 0", async () => {
  try {
    await deleteOldLogs();
  } catch (error) {
    console.error("Error in weekly cron job:", error);
  }
});

const deleteOldLogs = async () => {
  const secondsIn90Days = 60 * 60 * 24 * 90 * 1000; // 90 days in milliseconds
  const date90DaysAgo = new Date(Date.now() - secondsIn90Days);

  const year = date90DaysAgo.getFullYear();
  const month = String(date90DaysAgo.getMonth() + 1).padStart(2, "0");
  const day = String(date90DaysAgo.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} 00:00:00`;
  await query("DELETE FROM `inlog_logs`",[]);
  await query("DELETE FROM `gebeurtenis` WHERE `gelezen`='1' AND `datum`<?",[formattedDate]);
  await query("DELETE FROM `pokemon_wild_gevecht` WHERE `datainicio`<?",[formattedDate]);
  await query("DELETE FROM `pokemon_speler_gevecht` WHERE `datainicio`<?",[formattedDate]);
  await query("DELETE FROM `aanval_log` WHERE `datainicio`<?",[formattedDate]);
  await query("DELETE FROM `bank_logs` WHERE `date`<?",[formattedDate]);
  await query("DELETE FROM `battle_logs` WHERE `date`<?",[formattedDate]);
  await query("DELETE FROM `release_log` WHERE `date`<?",[formattedDate]);
  await query("DELETE FROM `transferlist_log` WHERE `date`<?",[formattedDate]);
  await query("UPDATE `pokemon_speler` SET `opzak`='nee' WHERE `opzak`='tra'",[]);

  await query("OPTIMIZE TABLE `aanval`, `aanval_log`, `aanval_new`, `arrowchat`, `arrowchat_admin`, `arrowchat_applications`, `arrowchat_banlist`, `arrowchat_chatroom_banlist`, `arrowchat_chatroom_messages`, `arrowchat_chatroom_rooms`, `arrowchat_chatroom_users`, `arrowchat_config`, `arrowchat_graph_log`, `arrowchat_notifications`, `arrowchat_notifications_markup`, `arrowchat_smilies`, `arrowchat_status`, `arrowchat_themes`, `arrowchat_trayicons`, `ban`, `bank_logs`, `battle_logs`, `berichten`, `bovenstuk`, `casino`, `characters`, `clans`, `clan_invites`, `clan_profiel`, `configs`, `cron`, `daycare`, `duel`, `duel_logs`, `effect`, `experience`, `forum_berichten`, `forum_categorieen`, `forum_topics`, `gebeurtenis`, `gebruikers`, `gebruikers_badges`, `gebruikers_item`, `gebruikers_tmhm`, `home`, `huizen`, `inlog_fout`, `inlog_logs`, `items`, `karakters`, `kluis_kraken`, `league`, `league_award`, `league_battle`, `league_participant`, `levelen`, `logs`, `log_troca_email`, `log_troca_nick`, `log_troca_senha`, `loterij`, `loterij_kaarten`, `markt`, `marktespecial`, `moverecorder`, `news`, `nieuws`, `PagSeguroTransacoes`, `paymentez`, `pokemon_nieuw_baby`, `pokemon_nieuw_gewoon`, `pokemon_nieuw_starter`, `pokemon_speler`, `pokemon_speler_gevecht`, `pokemon_wild`, `pokemon_wild_gevecht`, `premium`, `rank`, `release_log`, `tmhm`, `tmhm_movetutor`, `tmhm_relacionados`, `toernooi`, `toernooi_inschrijving`, `toernooi_ronde`, `traders`, `trainer`, `trainer_pokemon`, `transferlijst`, `transferlist_log`, `voordeel`, `wwvergeten`",[])
};
