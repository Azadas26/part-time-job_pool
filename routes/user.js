var express = require("express");
var router = express.Router();
var usebase = require("../database/userdb");

/* GET home page. */
router.get("/", function (req, res, next) {
  if( req.session.user)
  {
    res.render("./users/first-page", { userhd: true,user:req.session.user});
  }
  else
  {
    res.render("./users/first-page", { userhd: true });
  }
  
});
router.get("/signup", (req, res) => {
  if (req.session.emailexist) {
    res.render("./users/signup-page", {
      user: true,
      emailexist: "This Email Address Already Exist!",
    });
    req.session.emailexist = false;
  } else {
    res.render("./users/signup-page", { userhd: true });
  }
});
router.post("/signup", (req, res) => {
  usebase
    .Ckeck_whether_the_user_is_exist_or_NOt(req.body.email)
    .then((email) => {
      if (email) {
        req.session.emailexist = true;
        res.redirect("/signup");
      } else {
        usebase.Do_signup(req.body).then((data) => {
          res.redirect("/login");
        });
      }
    });
});
router.get("/login", (req, res) => {
  if(req.session.loginfail)
  {
    res.render("./users/login-page", { userhd: true,errorlogin:"Invalid Username or Password"});
    req.session.loginfail = false
  }
  else
  {
    res.render("./users/login-page", { userhd: true });
  }
});
router.post("/login",(req,res)=>
{
   usebase.Do_login(req.body).then((state)=>
   {
       if(state.status)
       {
          req.session.user = state.user;
          req.session.user.status = true;
          console.log(req.session.user);
          res.redirect("/")
       }
       else
       {
          req.session.loginfail = true
          res.redirect("/login")
       }
   })
})
router.get("/logout",(req,res)=>
{
   req.session.user = null;
   res.redirect("/login");
})

module.exports = router;