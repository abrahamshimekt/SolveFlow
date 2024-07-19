const express = require("express");
const User = require("../../models/User");
const passport = require("passport");
const router = express();

// Get Me
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await User?.findOne({ _id: req?.user?.id });
      res.status(200).json({ success: true, message: "Success", data: user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to read problems.");
    }
  }
);

module.exports = router;
