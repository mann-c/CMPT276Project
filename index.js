const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const { pool } = require("./dbconfig");
const PORT = process.env.PORT || 5000;
var bodyParser = require("body-parser");
const { LOADIPHLPAPI } = require("dns");
const intiliazePassport = require("./passport-config");
intiliazePassport(passport);

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => res.render("pages/index"));

app.get("/homepage", (req, res) => res.render("pages/homepage"));
app.get("/loginuser", checkAuthenticated, (req, res) =>
  res.render("pages/loginuser")
);
app.get("/registeruser", checkAuthenticated, (req, res) =>
  res.render("pages/registeruser")
);
app.get("/dashboard", checkNotAuthenticated, (req, res) =>
  res.render("pages/dashboard", { user: req.user })
);
app.get("/logout", (req, res) => {
  let errors = [];
  req.logOut();
  errors.push({ msg: "you have logged out" });
  res.render("pages/loginuser", {
    errors,
  });
});
app.get("/a", (req, res) => {
  var getUsersQuery = `SELECT * FROM users `;
  pool.query(getUsersQuery, (error, result) => {
    if (error) {
      res.end(error);
    }
    //console.log(result);
    var results = { rows: result.rows };
    res.render("pages/db", results);
  });
});

// app.post("/log", (req, res) => {
//   var usernameinput = req.body.username;
//   var password = req.body.password;
//   var usernamedata;
//   let errors = [];
//   var getUsersQuery = `SELECT * FROM users WHERE login='${usernameinput}'`;

//   pool.query(getUsersQuery, (error, result) => {
//     if (error) {
//       res.end(error);
//     }
//     ///passes username check
//     if (result.rowCount === 1) {
//       usernamedata = result.rows[0].login;
//       //passes password check
//       if (password === result.rows[0].password) {
//         console.log("password correct");
//       }
//       //fails password check
//       else {
//         errors.push({ msg: "incorrect password" });
//         res.render("pages/loginuser", {
//           errors,
//           usernameinput,
//           password,
//         });
//       }
//     }
//     ///fails username check
//     else {
//       errors.push({ msg: "login is invalid" });
//       res.render("pages/loginuser", {
//         errors,
//         usernameinput,
//         password,
//       });
//     }

//     ///res.render("pages/loginuser");
//   });
// });
app.post(
  "/log",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/loginuser",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/loginuser");
}

app.post("/reg", (req, res) => {
  var username = req.body.username;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var city = req.body.city;
  var password = req.body.password;
  let errors = [];
  let check = false;
  let inputplaced;
  pool.query(
    `SELECT * FROM users WHERE login='${username}'`,
    (error, result) => {
      if (error) {
        res.end(error);
      }
      console.log(result.rows.length);
      if (result.rows.length > 0) {
        console.log("same");
        errors.push({ msg: "Login is already taken" });
        console.log(errors[0]);
        res.render("pages/registeruser", {
          errors,
          username,
          first_name,
          last_name,
          city,
          password,
        });
      } else {
        pool.query(
          `INSERT INTO users VALUES('${username}','${first_name}','${last_name}','${city}','${password}')`,
          (error, result) => {
            if (error) {
              res.end(error);
            }
          }
        );
        res.redirect("/a");
      }
    }
  );
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
