const express = require("express");
const Problem = require("../../models/Problems");
const Thread = require("../../models/Thread");
const router = express();
const { validationResult, body } = require("express-validator");
const { default: mongoose } = require("mongoose");
const passport = require("passport");
const Library = require("../../models/Library");
const { chatProcessor } = require("../../config/modelConfig");
const {
  taskDescription,
  responseFormat,
} = require("../../constants/aiEvalUserMessage");
const {
  initialTaskImprovementInstructions,
} = require("../../constants/aiRequeryUserMessage");
const {
  plantUmlErrorCorrectionInstructions,
} = require("../../constants/aiCodeCorrectorUserMessage");
const {
  initialTaskImprovementNote,
} = require("../../constants/rejectUserMessage");
router.put(
  "/accept/:id",
  [
    body("response").notEmpty().withMessage("Response is required"),
    passport.authenticate("jwt", { session: false }),
  ],
  async (req, res) => {
    try {
      const { response } = req?.body;
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: [{ message: "Id is invalid" }] });
      }

      const problem = await Problem?.findOne({ _id: id });

      const thread = await Thread?.findOne({ problem: problem?._id });

      if (thread?._id) {
        let newResponse =
          thread?.response?.length > 0
            ? [...thread?.response, { ...response }]
            : [{ ...response }];
        await thread?.updateOne({
          response: newResponse,
        });
        await problem?.updateOne({ stepCount: newResponse?.length });
      } else {
        const responses = [{ ...response }];
        const newThread = new Thread({
          problem: problem?._id,
          user: req?.user?.id,
          response: responses,
        });
        await newThread?.save();
        await problem?.updateOne({ stepCount: responses?.length });
      }

      res?.status(200)?.json({ success: true, message: "Response Accepted" });
    } catch (error) {
      console.log(error);
      res?.status(500)?.json({ error: true, message: error?.message });
    }
  }
);

router.put(
  "/restart/:id",
  [
    body("response").notEmpty().withMessage("Response is required"),
    passport.authenticate("jwt", { session: false }),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: [{ message: "Id is invalid" }] });
      }

      const problem = await Problem.findByIdAndUpdate(
        id,
        { stepCount: 0 },
        { new: true }
      );
      if (!problem) {
        return res?.status(500)?.json({ message: "Problem not found" });
      }
      chatProcessor.data = {
        original: { role: "", content: "" },
        context: { role: "", content: "" },
        previous: { role: "", content: "" },
      };
      chatProcessor.steps = {};
      let thread = await Thread?.findOne({ problem: problem?._id });

      await thread?.deleteOne();

      res
        ?.status(200)
        ?.json({ success: true, message: "Restarted Successfully" });
    } catch (error) {
      console.log(error);
      res?.status(500)?.json({ error: true, message: error?.message });
    }
  }
);
// Ai checker end point
router.post(
  "/aiEval",
  [
    body("previousUserMessage")
      .notEmpty()
      .withMessage("Previous message is required"),
    body("aiInstruction"),
    body("aichecker").notEmpty().withMessage("AI checker persona is required"),
    body("currentResponse")
      .notEmpty()
      .withMessage("Current response is required"),
    body("language").notEmpty().withMessage("language required"),
    body("conversationId").notEmpty().withMessage("conversation Id required"),
    body("stepId").notEmpty().withMessage("step id is required"),
    body("libraryId").notEmpty().withMessage("library id is required"),
    body("debugLevel").notEmpty().withMessage("debug level is required"),
    body("action").notEmpty().withMessage("action is required"),
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

    const {
      previousUserMessage,
      aiInstruction = "",
      aichecker,
      currentResponse,
      language,
      conversationId,
      stepId,
      libraryId,
      debugLevel,
      action,
    } = req.body;
    let userMessage = ` ${taskDescription}
      
      ${aiInstruction}

     ${responseFormat}

      --------------------------------- Original TASK --------------------------------------
      ${previousUserMessage}

      --------------------------------- Current Answer --------------------------------------
      ${currentResponse}
      `;

    try {
      chatProcessor.language = language;
      const data = chatProcessor.data;
      userMessage = chatProcessor.replacePlaceholders(userMessage, data);
      const response = await chatProcessor.chatWithOpenAI(
        aichecker,
        userMessage,
        conversationId,
        stepId,
        libraryId,
        debugLevel,
        action
      );

      const check = JSON.parse(response.content);
      res.status(200).json({ success: true, data: check });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.post(
  "/aiRequery",
  [
    body("aichecker").notEmpty().withMessage("Ai checker required"),
    body("previousUserMessage")
      .notEmpty()
      .withMessage("previous user message required"),
    body("currentResponse").notEmpty().withMessage("current response required"),
    body("currentStepKey").notEmpty().withMessage("current step key required"),
    body("recommendations").notEmpty().withMessage("recommendations required"),
    body("language").notEmpty().withMessage("language required"),
    body("conversationId").notEmpty().withMessage("conversation Id required"),
    body("stepId").notEmpty().withMessage("step id is required"),
    body("libraryId").notEmpty().withMessage("library id is required"),
    body("debugLevel").notEmpty().withMessage("debug level is required"),
    body("action").notEmpty().withMessage("action is required"),
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

    const {
      aichecker,
      previousUserMessage,
      currentResponse,
      currentStepKey,
      recommendations,
      language,
      conversationId,
      stepId,
      libraryId,
      debugLevel,
      action,
    } = req.body;

    let userMessage = `
    ${initialTaskImprovementInstructions}

    --------------------------------- Original TASK --------------------------------------
    ${previousUserMessage}

    --------------------------------- Current Answer --------------------------------------
    ${currentResponse}

    --------------------------------- Recommendations --------------------------------------
    ${recommendations}
    `;

    const apiKey = process.env.OPEN_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: "Missing OpenAI API Key",
      });
    }

    try {
      chatProcessor.language = language;
      const data = chatProcessor.data;
      userMessage = chatProcessor.replacePlaceholders(userMessage, data);
      const response = await chatProcessor.chatWithOpenAI(
        aichecker,
        userMessage,
        conversationId,
        stepId,
        libraryId,
        debugLevel,
        action
      );
      const content = response?.content;
      if (chatProcessor?.data?.[currentStepKey]) {
        chatProcessor.data[currentStepKey] = content
          ? content
          : chatProcessor.data[currentStepKey];
      }
      res.status(200).json(response?.content);
    } catch (error) {
      console.error("ChatProcessor Error: ", error); // More detailed logging
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);
router.post(
  "/aicodeCorrector",
  [
    body("code").notEmpty().withMessage("code required"),
    body("codeError").notEmpty().withMessage("code error required"),
    body("language").notEmpty().withMessage("language required"),
    body("conversationId").notEmpty().withMessage("conversation Id required"),
    body("stepId").notEmpty().withMessage("step id is required"),
    body("debugLevel").notEmpty().withMessage("debug level is required"),
    body("action").notEmpty().withMessage("action is required"),
    body("libraryId").notEmpty().withMessage("library id required"),
    passport.authenticate("jwt", { session: false }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }

    const {
      code,
      codeError,
      language,
      conversationId,
      libraryId,
      stepId,
      debugLevel,
      action,
    } = req.body;

    const plantUmlCoder = "You are an expert and meticulous PlantUML coder.";
    let userMessage = `${plantUmlErrorCorrectionInstructions}

    -------------------------------------CODE---------------------------------------------
    ${code}

    --------------------------------------CODE ERROR----------------------------------------
    ${codeError}`;
    try {
      chatProcessor.language = language;
      const data = chatProcessor.data;
      userMessage = chatProcessor.replacePlaceholders(userMessage, data);
      const response = await chatProcessor.chatWithOpenAI(
        plantUmlCoder,
        userMessage,
        conversationId,
        stepId,
        libraryId,
        debugLevel,
        action
      );

      res.status(200).json(response?.content);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

router.post(
  "/:id",
  [
    body("content").notEmpty().withMessage("Content message is required"),
    body("humanCheckerAnswer"),
    body("conversationId").notEmpty().withMessage("Conversation ID required"),
    body("debugLevel").notEmpty().withMessage("Debug level is required"),
    body("action").notEmpty().withMessage("Action is required"),
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
        role,
        content,
        humanCheckerAnswer,
        additionalInformation,
        type,
        conversationId,
        debugLevel,
        action,
      } = req.body;

      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: [{ message: "ID is invalid" }] });
      }

      const original = content;
      const problem = await Problem.findOne({ _id: id });
      if (!problem) {
        return res
          .status(400)
          .json({ errors: [{ message: "Problem not found" }] });
      }

      const library = await Library.findOne({ _id: problem.library });

      if (!library?.steps || library.steps.length <= 0) {
        return res.status(400).json({
          errors: [{ message: "Please set the library steps first" }],
        });
      }

      let thread = await Thread.findOne({ problem: problem._id });

      if (type?.toString().toUpperCase() === "NEW") {
        await thread?.deleteOne();
      }

      thread = await Thread.findOne({ problem: problem._id });

      let lastStepIndex = library.steps?.findIndex(
        (item) =>
          item._id.toString() ===
          thread?.response[
            thread?.response?.length - 1
          ]?.library?.stepId.toString()
      );

      let step = library.steps[lastStepIndex + 1];

      if (lastStepIndex + 1 === library.steps.length) {
        return res.status(200).json({
          success: true,
          status: "GENERATED",
          message: "Completed",
        });
      }

      // Human checker
      let humanCheckerTask = "";

      if (step.task) {
        humanCheckerTask += step.task;
      }
      if (step.input) {
        humanCheckerTask += `\n---\n${step.input}`;
      }

      let userMessage = `
        --------------------------------- TASK --------------------------------------
        ${humanCheckerTask}

        --------------------------------- Current Answer --------------------------------------
        ${humanCheckerAnswer}
        `;
      let userWishes = "";
      if (step.humanCheckerPrompt) {
        userWishes += step.humanCheckerPrompt;
      }
      userWishes += ":" + additionalInformation;

      userMessage = `${initialTaskImprovementNote}${userMessage}

      --------------------------------- Recommendations --------------------------------------
      ${userWishes}
      `;

      let input = action === "reject" ? userWishes : step?.input;
      chatProcessor.language = problem.language;

      if (action === "reject") {
        const data = chatProcessor.data;
        userMessage = chatProcessor.replacePlaceholders(userMessage, data);
        const response = await chatProcessor.chatWithOpenAI(
          step.persona || "",
          userMessage,
          conversationId,
          step._id,
          library._id,
          debugLevel,
          action
        );
        let chatRes = {};
        const title = step?.key?.title;
        const content = response?.content;
        chatRes[step?.key] = { title, content };
        return res.status(200).json({
          success: true,
          status: "GENERATED",
          data: {
            ...chatRes,
            library: { _id: library._id, stepId: step._id },
            step,
            language: problem.language,
          },
        });
      } else {
        chatProcessor.initializeData(original);
        chatProcessor.addStep(
          step.key,
          step.title,
          step.order.toString(),
          step.persona,
          step.task,
          input,
          step.format,
          step.active,
          step.aiChecker,
          step.aiCheckerInstructions,
          step.aiCheckerThreshold,
          step.humanCheckerStyle,
          step.humanCheckerPrompt,
          step.humanCheckerThreshold
        );

        const chatRes = await chatProcessor.processSteps(
          conversationId,
          step._id,
          library._id,
          debugLevel,
          action
        );
        const data = chatProcessor.data;
        return res.status(200).json({
          success: true,
          status: "GENERATED",
          data: {
            ...chatRes,
            library: { _id: library._id, stepId: step._id },
            step,
            data,
            language: problem.language,
            libraryName: library.name,
          },
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true, message: error.message });
    }
  }
);

module.exports = router;
