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

const VarifyUser = (req, res, next) => {
  if (req.session.isVarified) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};

//根路徑 auth

router.get("/login", authCheck, (req, res) => {
  return res.render("login", { user: req.user });
});

//使用passport套件 passport.authtenticate()

/*
    第一個參數=>使用google認證
    第二個參數=>使用的資料範圍（profile:由 google 提供的個資）
    同意應用程式能夠向google取得的資料範圍
    profile => 姓名、頭像 等等
    email => 取得用戶email 
    prompt => 指定google登入流程中用戶的交互方式。
    "select_account" => 提供可選擇的帳號。
        => 執行這段會自動搜尋 google strategy  
   */
//要先設定 google strategy ，並在主程式執行才不會出錯。

/* 這裡是在其他資料夾設定的 passport.use(`google strategy`)   
    而這裡的 GoogleStrategy => 為引進 require("passport-google-oauth20")
   
    passport.use(
        new GoogleStrategy(
            {
            //這段內容代表 應用程式使用以下id/secret 向google取得token
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            //取得後導向回來
            callbackURL: "/auth/google/redirect",
            },
            //function 自動執行
            (accessToken, refreshToken, profile, done) => {
            console.log(profile);
            }
        )
    );
*/
router.get(
  "/google",
  passport.authenticate("google", {
    //要這些之前 已經讀取 google strategy ID / secret
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
//設定redirect 的route => 要跟當初在google申請時一樣
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("回到google/redirect的route");
  console.log(req.user);
  return res.redirect("/profile");
});

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

// //本地登入 方法設定 ： 用bcrypt.compare() / req.session設定傳遞資料
// router.post("/login", async (req, res) => {
//   let { username, password } = req.body;
//   let findMember = await Member.findOne({ email: username });
//   console.log(findMember);
//   if (findMember) {
//     let findHashed = await bcrypt.compare(password, findMember.password);
//     if (findHashed) {
//       req.session.member = findMember;
//       req.session.isVarified = true;
//       return res.redirect("/profile");
//     } else {
//       return res.redirect("/auth/login");
//     }
//   }
// });

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
