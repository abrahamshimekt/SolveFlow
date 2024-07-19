const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module-free");
const passport = require("passport");
const generateUniqueFilename = require("./utility/generateFileName");
const cleanupFiles = require("./utility/cleanUpFiles");
const opts = require("./utility/imageModuleOptions");
const checkAndConvertMarkdown = require("./utility/markDownIt");
const router = express.Router();
const createReport = require("docx-templates").default;
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${generateUniqueFilename()}_${file.originalname}`);
  },
});
const upload = multer({ storage }).any();
router.post(
  "/merge",
  upload,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const docFile = req.files.find((file) => file.fieldname === "doc");
    if (!docFile) {
      return res.status(400).send("Document file is required.");
    }

    const docFilePath = docFile.path;
    const content = fs.readFileSync(docFilePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater();
    const imageModule = new ImageModule(opts);
    let imageFiles = [];
    const data = {};
    try {
      doc.attachModule(imageModule);
      doc.loadZip(zip);

      const stepKeys = Object.keys(req.body).filter((key) =>
        key.startsWith("STEP_")
      );

      stepKeys.forEach((stepKey) => {
        data[stepKey] = checkAndConvertMarkdown(req.body[stepKey]);
      });
      const fileStepKeys = req.files
        .map((file) => file.fieldname)
        .filter(Boolean);
      fileStepKeys.forEach((fileStepKey) => {
        const imageFile = req.files.find(
          (file) => file.fieldname === fileStepKey
        );
        if (imageFile) {
          data[`${fileStepKey}`] = imageFile.path;
          imageFiles.push(imageFile.path);
        }
      });
      doc.setData(data);
      doc.render();
    } catch (renderError) {
      cleanupFiles(docFilePath, ...imageFiles);
      return res.status(500).send("Error processing document");
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });
    const itermidiaryFilePath = path.join(
      uploadDir,
      `${generateUniqueFilename()}`
    );

    try {
      fs.writeFileSync(itermidiaryFilePath, buf);

      const template = fs.readFileSync(itermidiaryFilePath);

      const buffer = await createReport({
        template,
        data,
        cmdDelimiter: ["++[", "]++"],
        processLineBreaks: true,
        noSandbox: false,
        failFast: true,
        rejectNullish: false,
        fixSmartQuotes: false,
        maximumWalkingDepth: 1_000_000,
      });

      const outputFilePath = path.join(
        uploadDir,
        `merged_${docFile.originalname}`
      );

      fs.writeFileSync(outputFilePath, buffer);

      cleanupFiles(docFilePath, itermidiaryFilePath, ...imageFiles);
      res.status(200).json({
        isSuccess: true,
        data: `${path.basename(outputFilePath)}`,
      });
    } catch (writeError) {
      console.error("Error writing merged document:", writeError);
      cleanupFiles(docFilePath, ...imageFiles, outputFilePath);
      res.status(500).send("Error saving merged document");
    }
  }
);

router.get(
  "/:filename",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const filename = req.params.filename;
    const documentPath = path.join(uploadDir, filename);
    res.sendFile(documentPath, (err) => {
      if (err) {
        res.status(404).send("Document not found");
      } else {
        cleanupFiles(documentPath);
      }
    });
  }
);

module.exports = router;
