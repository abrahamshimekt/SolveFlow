const fs = require("fs");
// Utility function to clean up files
const cleanupFiles = (...files) => {
  files.forEach((file) => {
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
};

module.exports = cleanupFiles;
