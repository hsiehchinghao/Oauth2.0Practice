//設定doenv放id / secret
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const routeLogin = require("./routes/routeLogin");
const routeProfile = require("./routes/routeProfile");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const Post = require("./models/postModel");

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

//connect-flash 設定
//設定在主程式 這樣全局 的 req / res 都能套用flash();
app.use(flash());
app.use((req, res, next) => {
  //locals為req裡面的屬性。
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//自訂中介=> 只要經由"/login"就套 routeLogin 這個 module
//app.use代表直接執行，程式碼解析經過這裡就執行
app.use("/auth", routeLogin);
app.use("/profile", routeProfile);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/post-section", async (req, res) => {
  let allPost = await Post.find({});
  console.log(allPost);

  return res.render("everyPost", { user: req.user, post: allPost.reverse() });
});

app.listen(8080, () => {
  console.log("成功運行8080");
});
