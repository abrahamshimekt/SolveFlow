
const ChatProcessor = require('../services/ChatProcessor');
const apiKey = process.env.OPEN_AI_API_KEY;
const model = "gpt-4-0613";
const systemRole = "system";
const userRole = "user";

const chatProcessor = new ChatProcessor(apiKey, model, systemRole, userRole);

const modelConfig = {
  chatProcessor,
};

module.exports = modelConfig;
