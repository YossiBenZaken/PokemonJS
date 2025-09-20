import authRoutes from "./auth.js";
import bankRoutes from './bank.js';
import casinoRoutes from './casino.js';
import characterRoutes from "./character.js";
import dayCareRoutes from './daycare.js';
import express from "express";
import fountainRoutes from './fountain.js';
import houseRoutes from './houses.js';
import itemRoutes from './items.js';
import marketRoutes from './market.js';
import pokemonRoutes from './pokemon.js';
import specialistsRoutes from './specialists.js';
import systemRoutes from './system.js';
import tradersRoutes from './traders.js';

const router = express.Router();
// נתיבי אימות חדשים עם MySQL
router.use('/api/auth', authRoutes);

// נתיבי דמויות
router.use('/api/characters', characterRoutes);
router.use('/api/system', systemRoutes);
router.use('/api/houses', houseRoutes);
router.use('/api/items', itemRoutes);
router.use('/api/market', marketRoutes);
router.use('/api/fountain', fountainRoutes);
router.use('/api/casino', casinoRoutes);
router.use('/api/pokemon', pokemonRoutes);
router.use('/api/daycare', dayCareRoutes);
router.use('/api/bank', bankRoutes);
router.use('/api/traders', tradersRoutes);
router.use('/api/specialists', specialistsRoutes);
export { router };
