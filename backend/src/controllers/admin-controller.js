import { query } from "../config/database.js";

export const getAdmins = async (_, res) => {
  const moderators = await query(
    "SELECT username FROM gebruikers WHERE admin = '1'",
    []
  );
  const administrators = await query(
    "SELECT username FROM gebruikers WHERE admin = '2'",
    []
  );
  const owners = await query(
    "SELECT username FROM gebruikers WHERE admin = '3'",
    []
  );
  return res.json({
    administrators,
    owners,
    moderators,
  });
};

export const removeAdmin = async (req, res) => {
  try {
    const { username } = req.body;
    await query("UPDATE gebruikers SET admin = '0' WHERE username = ?", [
      username,
    ]);
    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
    });
  }
};
export const addAdmin = async (req, res) => {
  try {
    const { username } = req.body;
    await query("UPDATE gebruikers SET admin = '1' WHERE username = ?", [
      username,
    ]);
    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
    });
  }
};
