const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  language: { type: String, default: "English" },
  stepCount: {
    type: Number,
  },
  maxCount: {
    type: Number,
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

const Problem = mongoose.model("problem", problemSchema);

module.exports = Problem;
