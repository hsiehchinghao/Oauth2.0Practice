const router = require("express").Router();

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("進入中介軟體authCheck");
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, (req, res) => {
  console.log("進入 profile 的 route");
  console.log(req.user);
  res.render("profile", { user: req.user });
});

module.exports = router;
