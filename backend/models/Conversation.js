const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: String },
  timestamp: { type: String },
});

const Conversation = mongoose.model("conversation", conversationSchema);

module.exports = Conversation;
