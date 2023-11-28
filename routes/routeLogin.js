const express = require("express");
const router = express.Router();
const passport = require("passport");
const Member = require("../models/memberModel");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const authCheck = (req, res, next) => {
  console.log("進入中介軟體authCheck");
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  } else {
    next();
  }
};

router.get("/login", authCheck, (req, res) => {
  return res.render("login", { user: req.user });
});

router.get(
  "/google",
  passport.authenticate("google", {
    //要這些之前 已經讀取 google strategy ID / secret
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
//設定redirect 的route => 要跟當初在google申請時一樣
// router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
//   console.log("回到google/redirect的route");
//   console.log(req.user);
//   return res.redirect("/profile");
// });

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
  }),
  (req, res) => {
    if (req.isAuthenticated()) {
      console.log("redirect");
      req.flash("success_msg", "成功登入");
      return res.redirect("/profile");
    } else {
      req.flash("error_msg", "登入失敗");
      return res.redirect("/auth/login");
    }
  }
);

router.get("/logout", (req, res) => {
  console.log("進入登出階段");
  req.logout((err) => {
    if (err) {
      res.send(err);
    } else {
      res.redirect("/auth/login");
    }
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  //避免如果為經由網頁的話，無法對其限制。
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度需要大於8");
    return res.redirect("/auth/signup");
  }
  let findMember = await Member.findOne({ email: email }).exec();
  console.log(findMember);
  if (findMember) {
    req.flash("error_msg", "用戶已註冊");
    return res.redirect("/auth/signup");
  } else {
    let hashedPassword = await bcrypt.hash(password, saltRounds);
    let newMember = new Member({
      name: name,
      email: email,
      password: hashedPassword,
    });
    await newMember.save();
    req.flash("success_msg", "成功註冊");
    return res.redirect("/auth/login");
  }
});

//passport設定登入
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login", //failureFlash 錯誤訊息 直接帶入
    failureFlash: "登入失敗",
    //這裏自動帶入app.use((req,res,next)=>{res.locals.error = req.flash("error")})
  }),
  async (req, res) => {
    //console.log(req.user); //確認passport有將使用者存 req.user 屬性
    return res.redirect("/profile");
  }
);

module.exports = router;
