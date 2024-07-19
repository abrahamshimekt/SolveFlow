const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const passport = require("passport");
const cleanupFiles = require("../document/utility/cleanUpFiles");
const generateUniqueFilename = require("../document/utility/generateFileName");
const getErrorLine = require("./utility/getErrorLIne");
const router = express.Router();
// Check if the PlantUML code has errors
router.post(
  "/check",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { plantumlCode, userId } = req.body;
    const base = generateUniqueFilename(userId);
    const tempFilePath = path.join(__dirname, `${base}.puml`);
    fs.writeFileSync(tempFilePath, plantumlCode);

    const jarFilePath = path.join(__dirname, "plantuml-mit-1.2024.6.jar");
    const imageFilePath = path.join(__dirname, `${base}.png`);

    exec(
      `java -jar ${jarFilePath} ${tempFilePath}`,
      (error, stdout, stderr) => {
        cleanupFiles(tempFilePath, imageFilePath);
        if (error) {
          const errorLine =getErrorLine(stderr, plantumlCode);
          res.status(200).json({
            isSuccess: false,
            data: `PlantUML syntax error found: ${stderr}\n${
              errorLine ? errorLine : ""
            }`,
          });
        } else {
          res.status(200).json({
            isSuccess: true,
            data: "PlantUML syntax is correct.",
          });
        }
      }
    );
  }
);

module.exports = router;
