const fs = require("fs");
const opts = {};
opts.centered = false;
opts.fileType = "docx";

// Pass image loader
opts.getImage = function (tagValue, tagName) {
  try {
    return fs.readFileSync(tagValue);
  } catch (error) {
    console.error("Error reading image file:", error);
    throw error;
  }
};

// Pass the function that returns image size
opts.getSize = function (img, tagValue, tagName) {
  return [200, 300];
};

module.exports = opts;
