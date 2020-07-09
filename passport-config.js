const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbconfig.js");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (req, username, password, done) => {
    console.log(username, password, req.body.utype);
    if (req.body.utype === "USER") {
      pool.query(
        `SELECT * FROM users WHERE login = $1`,
        [username],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);

          if (results.rows.length > 0) {
            const user = { data: results.rows[0], type: req.body.utype };

            //passes password check
            if (password === results.rows[0].password) {
              console.log("here");

              console.log(user);

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
        `SELECT * FROM restaurants WHERE id = $1`,
        [username],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);

          if (results.rows.length > 0) {
            const user = { data: results.rows[0], type: req.body.utype };

            //passes password check
            if (password === results.rows[0].password) {
              console.log("here");

              console.log(user);

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
  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser((user, done) => done(null, user));

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user

  passport.deserializeUser((user, done) => {
    if (user.type === "USER") {
      pool.query(
        `SELECT * FROM users WHERE login = $1`,
        [user.data.login],
        (err, results) => {
          if (err) {
            return done(err);
          }
          //console.log(`ID is ${results.rows[0].login}`);
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
          //console.log(`ID is ${results.rows[0].login}`);
          return done(null, user);
        }
      );
    }
  });
}
module.exports = initialize;
