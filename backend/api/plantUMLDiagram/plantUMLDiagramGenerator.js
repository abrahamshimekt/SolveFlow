const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const passport = require("passport");
const cleanupFiles = require("../document/utility/cleanUpFiles");
const generateUniqueFilename = require("../document/utility/generateFileName");
const router = express.Router();
// Generate PlantUML diagram
router.post(
  "/generateImage",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { plantumlCode, userId } = req.body;
    const base = generateUniqueFilename(userId);
    const tempFilePath = path.join(__dirname, `${base}.puml`);
    fs.writeFileSync(tempFilePath, plantumlCode);

    const plantUmlJarPath = path.join(__dirname, "plantuml-mit-1.2024.6.jar");
    const imageFilePath = path.join(__dirname, `${base}.png`);

    exec(
      `java -jar ${plantUmlJarPath} ${tempFilePath}`,
      (error, stdout, stderr) => {
        // Check if the image file was created
        if (fs.existsSync(imageFilePath)) {
          cleanupFiles(tempFilePath);
          res.status(200).json({
            isSuccess: true,
            data: path.basename(imageFilePath),
          });
        } else {
          cleanupFiles(tempFilePath);
          res.status(500).json({
            isSuccess: false,
            data: "Image generation failed",
          });
        }
      }
    );
  }
);
// Get the saved PlantUML Diagram
router.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, filename);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send("Image not found");
    } else {
      // Delete the image file after serving it
      cleanupFiles(imagePath);
    }
  });
});

module.exports = router;
