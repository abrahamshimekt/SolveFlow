const express = require("express");
const Problem = require("../../models/Problems");
const { default: mongoose } = require("mongoose");
const Thread = require("../../models/Thread");
const router = express();
const {
  validationResult,
  matchedData,
  body,
} = require("express-validator");
const passport = require("passport");
const Library = require("../../models/Library");

// Add a new problem
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("library").notEmpty().withMessage("Library is required"),
    body("language").notEmpty().withMessage("language is required"),
    passport.authenticate("jwt", { session: false }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const result = errors.formatWith((error) => {
      return { message: error.msg, error: true };
    });

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      const { title, description, library, language } = matchedData(req);
      const libraryDetails = await Library?.findOne({ _id: library });
      const problemToSave = {
        user: req?.user?.id,
        title,
        description,
        library,
        language,
        stepCount: 0,
        maxCount: libraryDetails?.steps?.length,
      };
      const problem = new Problem(problemToSave);
      await problem.save();

      res
        .status(200)
        .json({ success: true, message: "Problem added", data: problem });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to save the new problem.");
    }
  }
);


// delete problem
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if the ID is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: "Id is invalid" });
      }

      // Find the problem by id and user id
      const problem = await Problem.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

      // If the problem does not exist or does not belong to the user
      if (!problem) {
        return res.status(404).json({
          success: false,
          message:
            "Problem not found or you don't have permission to delete this problem",
        });
      }

      res.status(200).json({
        success: true,
        message: "Problem deleted successfully",
        errors: [],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete",
        errors: error.message,
      });
    }
  }
);

// Update an existing problem
router.put(
  "/:id",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("library").notEmpty().withMessage("Library is required"),
    body("language").notEmpty().withMessage("language is required"),
    passport.authenticate("jwt", { session: false }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const result = errors.formatWith((error) => {
      return { message: error.msg, error: true };
    });

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: [{ message: "Id is invalid" }] });
      }
      const { title, description, library, language } = matchedData(req);
      await Problem?.findOneAndUpdate(
        { _id: id, user: req?.user?.id },
        { title, description, library, language }
      );

      res.status(200).json({ success: true, message: "Problem updated" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to update the problem.");
    }
  }
);
// Get a problem
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: [{ message: "Id is invalid" }] });
      }
      const problem = await Problem.findOne({ _id: id, user: req.user.id }).populate('library', 'name');
      res.status(200).json({
        success: true,
        message: "Problem Retrieved Successfully",
        data: problem,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to retrieve the problem.");
    }
  }
);
// Get all problems
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const problems = await Problem?.find({
        user: new mongoose.Types.ObjectId(req?.user?.id),
      });

      res.status(200).json({
        success: true,
        message: "Success",
        data: problems,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to read problems.");
    }
  }
);

module.exports = router;
