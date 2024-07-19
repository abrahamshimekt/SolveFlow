const express = require("express");
const router = express();
const {
  validationResult,
  matchedData,
  body,
  check,
} = require("express-validator");
const passport = require("passport");
const ChatProcessor = require("../../services/ChatProcessor");

router.post(
  "/",
  [
    body("problem").notEmpty().withMessage("problem content is required"),
    body("key").notEmpty().withMessage("key is required"),
    body("title").notEmpty().withMessage("title i required"),
    body("order").notEmpty().withMessage("order is required"),
    body("persona"),
    body("task").notEmpty().withMessage("task is required"),

    body("input").notEmpty().withMessage("input is required"),
    body("format"),
    body("Active").notEmpty().withMessage("Active is required"),

    body("AIChecker").notEmpty().withMessage("AIChecker is required"),
    body("AIChecker_Instructions")
      .notEmpty()
      .withMessage("AIChecker_Instructions is required"),
    body("AIChecker_threshold")
      .notEmpty()
      .withMessage("AIChecker_threshold is required"),

    body("HumanChecker_Style")
      .notEmpty()
      .withMessage("HumanChecker_Style is required"),
    body("HumanChecker_Prompt")
      .notEmpty()
      .withMessage("HumanChecker_Prompt is required"),
    body("HumanChecker_Threshold")
      .notEmpty()
      .withMessage("HumanChecker_Threshold is required"),

    passport.authenticate("jwt", { session: false }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    const result = errors.formatWith((error) => {
      return { message: error.msg, error: true };
    });

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
      const {
        problem,
        key,
        title,
        order,
        persona,
        task,
        input,
        format,
        Active,
        AIChecker,
        AIChecker_Instructions,
        AIChecker_threshold,
        HumanChecker_Style,
        HumanChecker_Prompt,
        HumanChecker_Threshold,
      } = matchedData(req);

      const apiKey = process.env.OPEN_AI_API_KEY;
      const model = "gpt-4-0613";
      const systemRole = "system";
      const userRole = "user";

      const chatProcessor = new ChatProcessor(
        apiKey,
        model,
        systemRole,
        userRole
      );

      chatProcessor.initializeData(problem);

      chatProcessor.addStep(
        key,
        title,
        order?.toString(),
        persona,
        task,
        input,
        format,
        Active,
        AIChecker,
        AIChecker_Instructions,
        AIChecker_threshold,
        HumanChecker_Style,
        HumanChecker_Prompt,
        HumanChecker_Threshold
      );

      const chatRes = await chatProcessor?.processStepX();

      res.status(200).json({
        success: true,
        message: "step processed successfully",
        data: chatRes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to process step.");
    }
  }
);

module.exports = router;
