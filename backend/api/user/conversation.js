const express = require("express");
const Conversation = require("..//../models/Conversation");
const { validationResult, matchedData, body } = require("express-validator");
const passport = require("passport");
const router = express();

// add new conversation
router.post(
  "/",
  [
    body("conversationId").notEmpty().withMessage("Conversation Id required"),
    body("problemId").notEmpty().withMessage("Problem Id required"),
    body("userId").notEmpty().withMessage("user Id required"),

    passport.authenticate("jwt", { session: false }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const result = errors.formatWith((error) => {
      return { message: error.msg, error: true };
    });

    if (!result.isEmpty()) {
      return res.status(400).json({ success: false, error: result.array() });
    }

    try {
      const { conversationId, problemId, userId } = matchedData(req);

      const conversationToSave = {
        _id: conversationId,
        problemId,
        userId,
        timestamp: Date.now(),
      };

      const conversation = new Conversation(conversationToSave);
      await conversation.save();

      res.status(200).json({
        success: true,
        message: "conversation added",
        data: conversation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to save the new conversation.",
        error: error.message,
      });
    }
  }
);

// Get all conversations
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const conversations = await Conversation.find();

      res.status(200).json({
        success: true,
        message: "Success",
        data: conversations,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to read conversations.");
    }
  }
);

module.exports = router;
