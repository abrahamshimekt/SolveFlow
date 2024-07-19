const crypto = require("crypto");

// Generate a unique filename, with optional base parameter
const generateUniqueFilename = (base = '') => {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  return base ? `${base}-${uniqueId}` : uniqueId;
}

module.exports = generateUniqueFilename;
