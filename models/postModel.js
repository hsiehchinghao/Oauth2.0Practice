const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: String,
    require: true,
  },
});

//要輸出的是操作db的方法
module.exports = mongoose.model("Post", postSchema);
