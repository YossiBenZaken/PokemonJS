import {
  chooseStarterPokemon,
  createCharacter,
  fish,
  getAvailableCharacters,
  getAvailableStarterPokemon,
  getBadges,
  getCharacterDetails,
  getFishingLeaders,
  getMessages,
  getUserCharacterCount,
  getUserCharacters,
  getUserProfile,
  loginWithCharacter,
  myPokemon,
  readMessage,
  replyMessage,
  sendMessage,
  changeEmail,
  changePassword,
  getUserSettings,
  updateLevelChoice,
  updatePersonalSettings,
} from "../controllers/character-controller.js";

import express from "express";
import { extractAccId } from "../middleware/auth.js";
import { judgePokemon } from "../controllers/judge-controller.js";
import { validateCreateCharacter } from "../middleware/validation.js";

const router = express.Router();

// כל ה-routes דורשים אימות
router.use(extractAccId);

// יצירת דמות חדשה עם validation
router.post("/create", validateCreateCharacter, createCharacter);

// קבלת רשימת הדמויות הזמינות (לא דורש אימות)
router.get("/available", getAvailableCharacters);

// קבלת מספר הדמויות של המשתמש
router.get("/count", getUserCharacterCount);

// קבלת רשימת הדמויות של המשתמש
router.get("/my-characters", getUserCharacters);

// כניסה למשחק עם דמות
router.post("/login", loginWithCharacter);

// קבלת פרטי דמות ספציפית
router.get("/details/:user_id", getCharacterDetails);

// קבלת רשימת הפוקימונים הזמינים לבחירה ראשונה
router.get("/starter-pokemon/:user_id", getAvailableStarterPokemon);

// בחירת פוקימון ראשון
router.post("/choose-starter", chooseStarterPokemon);

// קבלת פרטי פרופיל של משתמש
router.get("/profile/:username", getUserProfile);

// קבלת הפוקימון
router.post("/my-pokemons", myPokemon);

router.post("/get-messages", getMessages);

router.post("/read-message", readMessage);

router.post("/reply-message", replyMessage);

router.post("/send-message", sendMessage);

router.post("/badges", getBadges);

router.post("/fish", fish);

router.get("/get-fishing-leaders", getFishingLeaders);

router.post("/judge", judgePokemon);

router.put("/account-settings/email", changeEmail);

router.put("/account-settings/password", changePassword);

router.get("/account-settings", getUserSettings);

router.put("/account-settings/level-choice", updateLevelChoice);

router.put("/account-settings/personal", updatePersonalSettings);

export default router;
