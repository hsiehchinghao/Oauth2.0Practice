// 建立Scehmaㄎ
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minLength: 3,
    maxLength: 255,
  },
  //本地端就不會有googleID 會有 自動產生的 ._id
  googleID: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  //圖片 google登入才會有 => 填入網址 由google製作
  thumbnail: {
    type: String,
  },
  //local login
  email: {
    type: String,
  },
  password: {
    type: String,
    minLength: 5,
    maxLength: 1024,
  },
});

module.exports = mongoose.model("Member", userSchema);
