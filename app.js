//設定doenv放id / secret
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const routeLogin = require("./routes/routeLogin");
const routeProfile = require("./routes/routeProfile");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 12;

//require 自動執行 => 先引進 function=>確認登入開始執行內部的登入策略。
require("./config/passport");

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/GoogleDB")
  .then(() => {
    console.log("成功連線mongoDB");
  })
  .catch((e) => {
    console.log(e);
  });

//排版引擎：*** app.set() ***
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//session 中介
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

//passport 的 middleware
app.use(passport.initialize()); //passport開始運行
app.use(passport.session()); //passport可以用session

//自訂中介=> 只要經由"/login"就套 routeLogin 這個 module
app.use("/auth", routeLogin);
app.use("/profile", routeProfile);

app.get("/", (req, res) => {
  console.log(req.isAuthenticated());
  res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log("成功運行8080");
});
