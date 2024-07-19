const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  steps: [
    {
      key: {
        type: String,
        default: "",
      },
      title: {
        type: String,
        default: "",
      },
      order: {
        type: Number,
        default: 0,
      },
      persona: {
        type: String,
        default: "",
      },
      task: {
        type: String,
        default: "",
      },
      input: {
        type: String,
        default: "",
      },
      format: {
        type: String,
        default: "",
      },
      active: {
        type: Boolean,
        default: true,
      },
      aiChecker: {
        type: String,
        default: "",
      },
      aiCheckerInstructions: {
        type: String,
        default: "",
      },
      aiCheckerThreshold: {
        type: Number,
        default: 10,
      },
      humanCheckerStyle: {
        type: String,
        default: "",
      },
      humanCheckerPrompt: {
        type: String,
        default: "",
      },
      humanCheckerThreshold: {
        type: Number,
        default: 10,
      },
    },
  ],
  name: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Library = mongoose.model("Library", librarySchema);

module.exports = Library;
