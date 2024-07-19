const { OpenAI } = require("openai");
const Log = require("../models/Log");

const {
  fontStyles,
  fontSizes,
  fontColors,
  warnings,
  code,
  useLanguge,
} = require("../constants/defaultInstructions");

class ChatProcessor {
  constructor(apiKey, model, systemRole, userRole, language = "English") {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.systemRole = systemRole;
    this.userRole = userRole;
    this.language = language;

    this.data = {
      original: { role: "", content: "" },
      context: { role: "", content: "" },
      previous: { role: "", content: "" },
    };
    this.steps = {};
  }

  async initializeData(original) {
    this.data.original.content = original;
    this.data.context.content = original;
  }
  async addStep(
    key,
    title,
    order,
    persona,
    task,
    input,
    format,
    active,
    aiChecker,
    aiCheckerInstructions,
    aiCheckerThreshold,
    humanCheckerStyle,
    humanCheckerPrompt,
    handleumanCheckerThreshold
  ) {
    this.steps[key] = {
      title,
      order,
      persona,
      task,
      input,
      format,
      active,
      aiChecker,
      aiCheckerInstructions,
      aiCheckerThreshold,
      humanCheckerStyle,
      humanCheckerPrompt,
      handleumanCheckerThreshold,
    };
  }

  replacePlaceholders(inputStr, data) {
    for (const key in data) {
      const placeholder = `[${key}]`;
      if (inputStr.includes(placeholder)) {
        inputStr = inputStr.replace(placeholder, data[key]["content"]);
      }
    }
    return inputStr;
  }

  async chatWithOpenAI(
    systemMessage,
    userMessage,
    conversationId,
    stepId,
    libraryId,
    debugLevel,
    action
  ) {
    const startTime = Date.now();
    userMessage += useLanguge(this.language);
    let output = "";
    let error = null;
    const systemInstructions = [
      {
        role: this.systemRole,
        content: `${fontStyles}`,
      },
      {
        role: this.systemRole,
        content: `${fontSizes}`,
      },
      {
        role: this.systemRole,
        content: `${fontColors}`,
      },
      {
        role: this.systemRole,
        content: `${warnings}`,
      },
      {
        role: this.systemRole,
        content: `${code}`,
      },
    ];
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          ...systemInstructions,

          { role: this.systemRole, content: systemMessage },
          { role: this.userRole, content: userMessage },
        ],
      });

      output = response?.choices[0]?.message;
    } catch (err) {
      error = err;
    } finally {
      const duration = Date.now() - startTime;
      const logToSave = {
        conversationId,
        stepId,
        libraryId,
        debugLevel,
        action,
        timestamp: Date.now(),
        duration,
        input: {
          systemMessage,
          userMessage,
          systemInstructions,
        },
        output,
        error,
      };

      const log = new Log(logToSave);

      await log.save();
    }

    return output;
  }

  async stepProcess(
    stepKey,
    conversationId,
    stepId,
    libraryId,
    debugLevel,
    action
  ) {
    try {
      const step = this.steps[stepKey];
      const systemMessage = step?.persona || "";
      let userMessage = `${step?.task || ""}\n---\n${step?.input || ""}`;
      userMessage = this.replacePlaceholders(userMessage, this.data);

      if (step?.format) {
        userMessage += `\n---\nFormat using ${step.format}`;
      }

      let firstResponse = await this.chatWithOpenAI(
        systemMessage,
        userMessage,
        conversationId,
        stepId,
        libraryId,
        debugLevel,
        action
      );

      this.data.previous.content = firstResponse?.content;
      this.data.previous.role = firstResponse?.role;

      if (!this.data[stepKey]) {
        this.data[stepKey] = {};
      }

      this.data[stepKey]["content"] = this.data?.previous?.content;
      return this.data;
    } catch (error) {
      return "";
    }
  }

  async processSteps(conversationId, stepId, libraryId, debugLevel, action) {
    const stepKeys = Object.keys(this.steps).sort(
      (a, b) => this.steps[a].Order - this.steps[b].Order
    );

    const processedContent = {};
    const stepKey = stepKeys[stepKeys.length - 1];
    if (this.steps[stepKey]?.active) {
      try {
        const stepData = await this.stepProcess(
          stepKey,
          conversationId,
          stepId,
          libraryId,
          debugLevel,
          action
        );
        const title = this.steps[stepKey]?.title;
        const content = stepData.previous?.content;

        processedContent[stepKey] = { title, content };
      } catch (error) {
        console.error(`Error processing step ${stepKey}:`, error);
      }
    }

    return processedContent;
  }
}

module.exports = ChatProcessor;
