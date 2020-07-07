const { authenticate } = require("passport");
const { compare } = require("bcrypt");

const LocalStrategy = require("passport-local").Strategy;

function intiliaze(passport, getUserByUsername) {
  const authenticate = (username, password, done) => {
    const user = getUserByUsername(username);
    if (user == null) {
      return done(null, false, { message: "NO USER with that username" });
    }
    if (compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: "password does not match" });
    }
  };
  passport.use(
    new LocalStrategy({ usernameField: "username" }),
    authenticateuser
  );
  passport.serializeUser((user, done) => {});
  passport.deserializeUser((id, done) => {});
}
module.export = intiliaze;
