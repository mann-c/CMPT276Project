const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbconfig.js");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (req, username, password, done) => {
    if (req.body.utype === "USER") {
      pool.query(
        `SELECT * FROM users WHERE login = $1`,
        [username],
        (err, results) => {
          if (err) {
            throw err;
          }

          if (results.rows.length > 0) {
            const user = { data: results.rows[0], type: req.body.utype };

            //passes password check
            if (password === results.rows[0].password) {

              return done(null, user);
            }
            //fails password check
            else {
              return done(null, false, { message: "Password is incorrect" });
            }
          } else {
            // No user
            return done(null, false, {
              message: "No user with that login address",
            });
          }
        }
      );
    } else {
      pool.query(
        `SELECT * FROM restaurantusers WHERE username = $1`,
        [username],
        (err, results) => {
          if (err) {
            throw err;
          }
          
          if (results.rows.length > 0) {
            const user = { data: results.rows[0], type: req.body.utype };
            //passes password check
            if (password === results.rows[0].password) {
              return done(null, user);
            }
            //fails password check
            else {
              return done(null, false, { message: "Password is incorrect" });
            }
          } else {
            // No user
            return done(null, false, {
              message: "No restaurant with that login id",
            });
          }
        }
      );
    }
  };
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => done(null, user));

  passport.deserializeUser((user, done) => {
    if (user.type === "USER") {
      pool.query(
        `SELECT * FROM users WHERE login = $1`,
        [user.data.login],
        (err, results) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        }
      );
    } else {
      pool.query(
        `SELECT * FROM restaurants WHERE id = $1`,
        [user.data.id],
        (err, results) => {
          if (err) {
            return done(err);
          }
          return done(null, user);
        }
      );
    }
  });
}
module.exports = initialize;
