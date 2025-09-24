// cron-setup.js - Main cron job setup file

import {
  forceRefreshAllTraders,
  runTradersCronManually,
  startTradersCron,
  stopTradersCron,
} from "./traders-cron.js";
import { runDayCronManually, startDayCron, stopDayCron } from "./cron-daily.js";
import {
  runDaycareCronManually,
  startDaycareCron,
  stopDaycareCron,
} from "./daycare-cron.js";
import {
  runMarketCronManually,
  startMarketCron,
  stopMarketCron,
} from "./market-cron.js";

// Start all cron jobs when server starts
export const startAllCronJobs = () => {
  console.log("Starting all cron jobs...");

  // Start daycare cron job
  startDaycareCron();

  // Start market cron job (every 6 hours)
  startMarketCron();

  // Start traders cron job (every 4 hours)
  startTradersCron();

  startDayCron(); // קרון יומי
  // Add other cron jobs here as needed
  // startOtherCron();
};

// Stop all cron jobs (useful for graceful shutdown)
export const stopAllCronJobs = () => {
  console.log("Stopping all cron jobs...");

  stopDaycareCron();
  stopMarketCron();
  stopTradersCron();
  stopDayCron();

  // Stop other cron jobs here
  // stopOtherCron();
};

// Manual cron execution endpoints (for testing or admin use)
export const setupManualCronRoutes = (app) => {
  // Manual day cron execution
  app.post("/admin/cron/day", async (req, res) => {
    try {
      const result = await runDayCronManually();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "שגיאה בהרצת קרון יומי",
        error: error.message,
      });
    }
  });

  // Manual daycare cron execution
  app.post("/admin/cron/daycare", async (req, res) => {
    try {
      const result = await runDaycareCronManually();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error executing daycare cron",
        error: error.message,
      });
    }
  });

  // Manual market cron execution
  app.post("/admin/cron/market", async (req, res) => {
    try {
      const result = await runMarketCronManually();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error executing market cron",
        error: error.message,
      });
    }
  });

  // Manual traders cron execution
  app.post("/admin/cron/traders", async (req, res) => {
    try {
      const result = await runTradersCronManually();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error executing traders cron",
        error: error.message,
      });
    }
  });

  // Set all Pokemon market items as unavailable (for testing)
  app.post("/admin/cron/market/reset", async (req, res) => {
    try {
      const result = await setAllPokemonUnavailable();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error resetting market items",
        error: error.message,
      });
    }
  });
  // Force refresh all traders (clear and reassign offers)
  app.post("/admin/cron/traders/refresh", async (req, res) => {
    try {
      const result = await forceRefreshAllTraders();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error refreshing all traders",
        error: error.message,
      });
    }
  });

  console.log("Manual cron routes setup at /admin/cron/*");
};
