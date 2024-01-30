var express = require("express");
var router = express.Router();
var wrkbase = require("../database/workersdb");
const twilio = require("twilio");
var otp = require('../connection/otp')

/* GET home page. */
var wkverifyotp =
{
  ph : null,
  otp:null
}

var verifyworker = (req,res,next)=>
{
    if( req.session.wrker)
    {
        next()
    }
    else
    {
        res.redirect("/worker/login")
    }
}

router.get("/", function (req, res, next) {
  if( req.session.wrker)
  {
    res.render("./workers/first-page", { wk: true,user:req.session.wrker});
  }
  else
  {
    res.render("./workers/first-page", { wk: true });
  }
  
});
router.get("/signup", (req, res) => {
  if (req.session.wkemailexist) {
    res.render("./workers/signup-page", {
      emailexist: "This Email Address Already Exist!",
    });
    req.session.wkemailexist = false;
  } 
  else if( req.session.wkaadharexist)
  {
    res.render("./workers/signup-page", {
      aadharexist: "This Aadhar Number Already Exist!",
    });
    req.session.wkaadharexist = false;
  }
  else {
    res.render("./workers/signup-page");
  }
});
router.post("/signup", (req, res) => {
  //console.log(req.body);
  wrkbase
    .Ckeck_whether_the_user_is_exist_or_NOt(req.body.email)
    .then((email) => {
      if (email) {
        req.session.wkemailexist = true;
        res.redirect("/worker/signup");
      } else {
       wrkbase.Check_Whether_The_AaDhar_is_EXIST_or_not(req.body).then((aadhar)=>
       {
          if(aadhar)
          {
            req.session.wkaadharexist = true;
            res.redirect("/worker/signup");
          }
          else
          {
            wrkbase.Do_signup(req.body).then(async(id) => {
              res.redirect("/worker/login");
              wkverifyotp.ph = req.body.ph;
              var image = req.files.image
              req.body.proof = false
              if(image)
              {
                await image.mv("public/wkaadhar/" + id + ".jpg", (err, data) => {
                  if (err) {
                      console.log(err);
                  }
              })
              }
              var proof = req.files.proof
              if(proof)
              {
                req.body.proof = true
                await image.mv("public/workers-proof/" + id + ".jpg", (err, data) => {
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
  if(req.session.wrker)
  {
      res.redirect("/worker/")
  }
  else
  {
    if(req.session.wkloginfail)
  {
    res.render("./workers/login-page", {errorlogin:"Invalid Username or Password"});
    req.session.loginfail = false
  }
  else
  {
    res.render("./workers/login-page");
  }
  }
  
});
router.post("/login",(req,res)=>
{
   wrkbase.Do_login(req.body).then((state)=>
   {
       if(state.status)
       {
          req.session.wrker = state.user;
          req.session.wrker.status = true;
          console.log(req.session.user);
          res.redirect("/worker/")
       }
       else
       {
          req.session.wkloginfail = true
          res.redirect("/worker/login")
       }
   })
})
router.get("/logout",(req,res)=>
{
   req.session.wrker = null;
   res.redirect("/worker//login");
})
router.get("/otp",async(req,res)=>
{     
  if(req.session.wkotp)
  {
    res.render("./workers/otp-page",{otperr:"Incorrect OTP Number"});
    req.session.wkotp = false
  }
  else
  {
     otp.Generate_Otp(wkverifyotp.ph).then((otp)=>
     {
         wkverifyotp.otp = otp;
         res.render('./workers/otp-page',{wk:true})
     })
     
  }
})
router.post("/otp",(req,res)=>
{
    if(wkverifyotp.otp == req.body.otp)
    {
      res.redirect("/worker/login")
    }
    else
    {
      req.session.wkotp = true;
      res.redirect("/worker/otp");
    }
})
router.get("/applayjob",verifyworker,(req,res)=>
{
   wrkbase.View_available_Jobs().then((jobs)=>
   {
      // console.log(jobs);
      res.render('./workers/jobs-page',{wk: true,user:req.session.wrker,jobs})
   })
})
router.post("/applayjob",verifyworker,(req,res)=>
{
    console.log(req.query.wkid,req.query.userid,req.session.wrker._id);
    wrkbase. Assign_Worker_to_Their_Redy_To_join(req.query.wkid,req.query.userid,req.session.wrker._id).then((resc)=>
    {
      wrkbase.View_available_Jobs().then((jobs)=>
      {
         // console.log(jobs);
        
         if(resc)
         {
          res.render('./workers/jobs-page',{wk: true,user:req.session.wrker,jobs,already:"Your Already In"})
         }
         else
         {
          res.render('./workers/jobs-page',{wk: true,user:req.session.wrker,jobs,succ:"Requested Successfully Commited"})
         }
      })
    })
})

module.exports = router;