const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const User = require("../models/User");

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User?.findOne({ _id: jwt_payload?.user?.id });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      console.log(`ERROR IN JWT STRATEGY: ${error}`);
      return done(null, false);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, callback) {
      callback(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
