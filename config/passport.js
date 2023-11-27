/* 
    passport.js
    這裡放有關strategy的內容:
        包含 本地登入策略 或 google strategy 等等
*/

const passport = require("passport");
//constructor function: 建立策略
const GoogleStrategy = require("passport-google-oauth20");
//local strategy :本地策略
const LocalStrategy = require("passport-local");

//引進 models
const Member = require("../models/memberModel");

//bcrypt 引進
const bcrypt = require("bcrypt");

//strategy 裡的 done 執行時自動執行 serializeUser()
passport.serializeUser((user, done) => {
  console.log("進入serializeUser");
  //這裏的done跟strategy裡的done沒有關聯
  //console.log(user); //這裏的user代表存在mongoDB裡的資料
  console.log("執行serializeUser內部的done");
  done(null, user._id); //將mongoDB的id，存在session=>簽名後以cookie給使用者
  //這裏的done執行時 也會帶入兩個功能：
  //1.參數的值放入session內部，且用戶端設置cookie(connect.sid)
  //2.req.Authenticated(): true
  console.log("結束serializeUser()");
});

//deserializeUser => 將session內的id取出=> 到db內找資料
passport.deserializeUser(async (id, done) => {
  //req.user / isAuthenticatd
  console.log("進入deserializeUser");
  let findMember = await Member.findOne({ _id: id });
  console.log("執行deserializeUser內的done");
  done(null, findMember);
  console.log("結束deserializeUser()");
  //console.log(req.user);這裏沒有req.user
  //done執行時會產生
});

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
    //done 在執行時 =>
    //會透過express.session 自動執行 passport.serializeUser()
    //serializeUser()兩個參數 user / done
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("進入google strategy 的function流程");
        console.log(profile);
        console.log("===================");
        let foundUser = await Member.findOne({ googleID: profile.id }).exec();
        if (foundUser) {
          console.log("已註冊過，無需重新存入");
          //done => 執行 serializeUser();
          //done函數是一個訊號，告知passport已經完成認證過程，
          //將用戶數據 從認證流程傳給序列化過程
          //done參數：
          //1.為錯誤對象 2.用戶對象
          done(null, foundUser);
          console.log("google strategy結束流程");
        } else {
          console.log("準備註冊");
          let newMember = await new Member({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          });
          let saveMember = await newMember.save();
          console.log("成功創建新用戶");
          //done
          console.log("執行內部的done");
          done(null, saveMember);
          console.log("google strategy結束流程");
        }
      } catch (e) {
        console.log(e);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    //passport會自動套入 ejs裡的 username / password 所以 name 屬性不能改
    console.log("comes to local strartegy");
    console.log(username);
    let findMember = await Member.findOne({ email: username }).exec();
    console.log(findMember);
    if (findMember) {
      let result = await bcrypt.compare(password, findMember.password);
      if (result) {
        done(null, findMember); //findMember => serializeUser() / deserializeUser()
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
