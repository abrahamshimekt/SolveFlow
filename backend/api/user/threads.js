const express = require("express");
const Thread = require("../../models/Thread");
const { default: mongoose } = require("mongoose");
const passport = require("passport");
const router = express();
router.get(
  "/:problemId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { problemId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(req?.user?.id) ||
        !mongoose.Types.ObjectId.isValid(problemId)
      ) {
        return res.status(400).json({ errors: [{ message: "Id is invalid" }] });
      }

      const thread = await Thread.find({
        user: new mongoose.Types.ObjectId(req?.user?.id),
        problem: new mongoose.Types.ObjectId(problemId),
      });

      res.status(200).json({ success: true, message: "Success", data: thread });
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to read thread.");
    }
  }
);
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req?.user?.id)) {
        return res.status(400).json({ errors: [{ message: "Id is invalid" }] });
      }

      const threads = await Thread?.find({
        user: new mongoose.Types.ObjectId(req?.user?.id),
      });

      res
        .status(200)
        .json({ success: true, message: "Success", data: threads });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to read threads.");
    }
  }
);

module.exports = router;
