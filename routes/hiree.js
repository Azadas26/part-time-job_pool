var express = require("express");
var router = express.Router();
var hibase = require("../database/hireedb");
const twilio = require("twilio");
var otp = require('../connection/otp')

/* GET home page. */
var verifyotp =
{
  ph : null,
  otp:null
}

router.get("/", function (req, res, next) {
  if( req.session.hi)
  {
    res.render("./hirees/first-page", { hi: true,user:req.session.hi});
  }
  else
  {
    res.render("./hirees/first-page", { hi: true });
  }
  
});
router.get("/signup", (req, res) => {
  if (req.session.hiemailexist) {
    res.render("./hirees/signup-page", {
      emailexist: "This Email Address Already Exist!",
    });
    req.session.hiemailexist = false;
  } 
  else if( req.session.hiaadharexist)
  {
    res.render("./hirees/signup-page", {
      aadharexist: "This Aadhar Number Already Exist!",
    });
    req.session.hiaadharexist = false;
  }
  else {
    res.render("./hirees/signup-page");
  }
});
router.post("/signup", (req, res) => {
  //console.log(req.body);
  hibase
    .Ckeck_whether_the_user_is_exist_or_NOt(req.body.email)
    .then((email) => {
      if (email) {
        req.session.hiemailexist = true;
        res.redirect("/Hiree/signup");
      } else {
        hibase.Check_Whether_The_AaDhar_is_EXIST_or_not(req.body).then((aadhar)=>
       {
          if(aadhar)
          {
            req.session.hiaadharexist = true;
            res.redirect("/Hiree/signup");
          }
          else
          {
            hibase.Do_signup(req.body).then(async(id) => {
              res.redirect("/Hiree/login");
              //console.log(req.body.ph);
              verifyotp.ph = req.body.ph;
              var image = req.files.image
              if(image)
              {
                await image.mv("public/hireeaadhar/" + id + ".jpg", (err, data) => {
                  if (err) {
                      console.log(err);
                  }
              })
              }
            });
          }
       })
      }
    });
});
router.get("/login", (req, res) => {
  if(req.session.hi)
  {
      res.redirect("/Hiree")
  }
  else
  {
    if(req.session.hiloginfail)
  {
    res.render("./hirees/login-page", { userhd: true,errorlogin:"Invalid Username or Password"});
    req.session.hiloginfail = false
  }
  else
  {
    res.render("./hirees/login-page");
  }
  }
  
});
router.post("/login",(req,res)=>
{
  hibase.Do_login(req.body).then((state)=>
   {
       if(state.status)
       {
          req.session.hi = state.user;
          req.session.hi.status = true;
          //console.log(req.session.hi);
          res.redirect("/Hiree")
       }
       else
       {
          req.session.hiloginfail = true
          res.redirect("/Hiree/login")
       }
   })
})
router.get("/logout",(req,res)=>
{
   req.session.hi = null;
   res.redirect("/Hiree/login");
})
router.get("/otp",async(req,res)=>
{     
  if(req.session.otp)
  {
    res.render("./hirees/otp-page",{otperr:"Incorrect OTP Number"});
    req.session.otp = false
  }
  else
  {
    console.log(verifyotp);
     otp.Generate_Otp(verifyotp.ph).then((otp)=>
     {
         verifyotp.otp = otp;
         res.render('./hirees/otp-page',{userhd:true})
     })
     
  }
})
router.post("/otp",(req,res)=>
{
    if(verifyotp.otp == req.body.otp)
    {
      res.redirect("/Hiree/login")
    }
    else
    {
      req.session.otp = true;
      res.redirect("/Hiree/otp");
    }
})
module.exports = router;