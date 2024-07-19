const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  conversationId: { type: String, ref: "Conversations" },
  stepId: { type: mongoose.Schema.Types.ObjectId },
  libraryId: { type: mongoose.Schema.Types.ObjectId },
  debugLevel: { type: Number, enum: [0, 1, 2], default: 0 },
  action: { type: String },
  timestamp: { type: String },
  duration: { type: Number },
  input: { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
  error: { type: mongoose.Schema.Types.Mixed },
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
