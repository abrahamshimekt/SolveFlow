const express = require("express");
const {
  validationResult,
  matchedData,
  body,
  check,
} = require("express-validator");
const passport = require("passport");
const Library = require("../../models/Library");
const router = express();

// Add new library
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("steps").isArray().withMessage("Steps are required"),
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
      // const { key, title, order, task, persona, input, format } =
      //   matchedData(req);
      const { name, steps } = matchedData(req);
      const mustIncludes = [
        "key",
        "title",
        "order",
        "persona",
        "task",
        "input",
        "format",
      ];

      const errors = [];

      for (let step of steps) {
        const missingKeys = [];

        for (let key of mustIncludes) {
          if (!(key in step)) {
            missingKeys.push({ key, value: step[key] });
          }
        }

        if (missingKeys?.length > 0) {
          missingKeys.forEach(({ key, value }) => {
            errors.push({ message: `${key} is required` });
          });
        }
      }

      if (errors?.length > 0) {
        return res.status(400).json({ errors: errors });
      }

      const library = new Library({
        name,
        steps,
      });
      await library?.save();

      res.status(200).json({ success: true, message: "Library created" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to save the library");
    }
  }
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const library = await Library?.find();
      res
        .status(200)
        .json({ success: true, data: library, message: "Library fetched" });
    } catch (error) {
      console.error(err);
      res.status(500).send("Failed to stepss.");
    }
  }
);
module.exports = router;
