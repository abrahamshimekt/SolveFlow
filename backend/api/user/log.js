const express = require("express");
const Log = require("../../models/Log");
const {
  matchedData,
  body,
} = require("express-validator");
const passport = require("passport");
const router = express();

// add new log
router.post(
  "/",
  [
    body("conversationId").notEmpty().withMessage("conversation Id is required"),
    body("stepId"),
    body("libraryId"),
    body("debugLevel"),
    body("action"),
    body("duration"),
    body("input"),
    body("output"),
    body("error"),
    passport.authenticate("jwt", { session: false }),
  ],
  async (req, res) => {
    try {
      const {
        conversationId,
        stepId,
        libraryId,
        debugLevel,
        action,
        duration,
        input,
        output,
        error,
      } = matchedData(req);

      const logToSave = {
        conversationId,
        stepId,
        libraryId,
        debugLevel,
        action,
        timestamp: Date.now(),
        duration,
        input,
        output,
        error,
      };

      const log = new Log(logToSave);
      await log.save();

      res.status(200).json({ success: true, message: "log added", data: log });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to save the new log.",
        error: error.message,
      });
    }
  }
);

// Get all logs
router.get(
  "/",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const logs = await Log.find();

      res.status(200).json({
        success: true,
        message: "Success",
        data: logs,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to read logs.");
    }
  }
);
router.get("/currentlogs", async (req, res) => {
  try {
    const { stepId, conversationId } = req.query;

    // Fetch logs based on stepId and conversationId
    const stepLogs = await Log.find({
      stepId: stepId,
      conversationId: conversationId,
    });

    const combinedJson = {};
    stepLogs.forEach((log, index) => {
      combinedJson[`log_${index}`] = log;
    });

    res.status(200).json(combinedJson);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching logs" });
  }
});

router.delete("/", async (req, res) => {
  try {
    await Log.deleteMany({});
    res.status(200).json({ message: "All logs have been deleted." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting logs" });
  }
});

module.exports = router;
