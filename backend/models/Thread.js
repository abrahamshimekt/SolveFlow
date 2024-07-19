const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "problems",
  },
  response: {
    type: Array,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
});

const Thread = mongoose.model("thread", threadSchema);

module.exports = Thread;
