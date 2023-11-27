const router = require("express").Router();
const Post = require("../models/postModel");
const authCheck = (req, res, next) => {
  if (req.isAuthenticated() || req.session.isVarified == true) {
    console.log("進入中介軟體authCheck");
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, async (req, res) => {
  console.log("進入 profile 的 route");
  console.log(req.user);
  let findPost = await Post.find({ author: req.user._id });
  console.log(findPost);
  // console.log(req.user);//用passport的方法
  // console.log(req.session.member);//不用passport的方法
  return res.render("profile", { user: req.user, post: findPost });
});

router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  try {
    let { title, content } = req.body;
    let savePost = await new Post({
      title: title,
      content: content,
      author: req.user._id,
    }).save();
    req.flash("success_msg", "成功新增post");
    console.log(savePost);
    return res.redirect("/profile");
  } catch (e) {
    console.log(e);
    req.flash("error_msg", "新增post失敗");
    return res.redirect("/profile");
  }
});

module.exports = router;
