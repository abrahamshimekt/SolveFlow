const express = require("express");
const passport = require("passport");
const User = require("../../models/User");
const router = express();
const jwt = require("jsonwebtoken");

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
  "/google/callback",
  passport.authenticate("google"),
  async (req, res) => {
    if (!req?.user) {
      return res.redirect(`/api/auth/google/failed/Google login failed`);
    }
    const { name, email } = req?.user?._json;
    try {
      const userDetails = await User.findOne({
        email: email,
      }).select("-password");
      if (userDetails) {
        const payload = {
          user: {
            id: userDetails?._id,
          },
        };
        jwt.sign(payload, process.env.JWT_SECRET, {}, (err, token) => {
          if (err) {
            throw err;
          } else {
            res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
          }
        });
      } else {
        let userDetails = {
          name,
          email,
        };
        const user = new User(userDetails);
        const response = await user.save();
        const payload = {
          user: {
            id: response?._id,
          },
        };
        jwt.sign(payload, process.env.JWT_SECRET, {}, (err, token) => {
          if (err) {
            throw err;
          } else {
            res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
          }
        });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect(`/api/auth/google/failed/Google login failed`);
    }
  }
);

router.get("/google/failed/:message", (req, res) => {
  const { message } = req.params;
  res.redirect(`${process.env.CLIENT_URL}/google?failed=${message}`);
});

router.get("/google/logout", (req, res) => {
  // if (!req?.user) {
  //   return res.status(400).json({ errors: [{ message: "Not Authorized" }] });
  // }
  req.logout(req?.user, (err) => {
    if (err) {
      return res.status(400).json({
        errors: [{ message: "Error occurred while logging out", details: err }],
      });
    }
    res
      .status(200)
      .json({ message: "User logged out successfully", success: true });
  });
});

module.exports = router;
