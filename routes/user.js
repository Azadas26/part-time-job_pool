var express = require("express");
var router = express.Router();
var usebase = require("../database/userdb");
const twilio = require("twilio");
var otp = require('../connection/otp')
var objectId = require('mongodb').ObjectId


var verfyuserlogin = (req,res,next)=>
{
    if(req.session.user)
    {
      next()
    }
    else
    {
      res.redirect('/login')
    }
} 
/* GET home page. */
var verifyotp =
{
  ph : null,
  otp:null
}

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
      emailexist: "This Email Address Already Exist!",
    });
    req.session.emailexist = false;
  } 
  else if( req.session.aadharexist)
  {
    res.render("./users/signup-page", {
      aadharexist: "This Aadhar Number Already Exist!",
    });
    req.session.aadharexist = false;
  }
  else {
    res.render("./users/signup-page");
  }
});
router.post("/signup", (req, res) => {
  //console.log(req.body);
  usebase
    .Ckeck_whether_the_user_is_exist_or_NOt(req.body.email)
    .then((email) => {
      if (email) {
        req.session.emailexist = true;
        res.redirect("/signup");
      } else {
       usebase.Check_Whether_The_AaDhar_is_EXIST_or_not(req.body).then((aadhar)=>
       {
          if(aadhar)
          {
            req.session.aadharexist = true;
            res.redirect("/signup");
          }
          else
          {
            usebase.Do_signup(req.body).then(async(id) => {
              res.redirect("/login");
              //console.log(req.body.ph);
              verifyotp.ph = req.body.ph;
              var image = req.files.image
              if(image)
              {
                await image.mv("public/useraadhar/" + id + ".jpg", (err, data) => {
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
  if(req.session.user)
  {
      res.redirect("/")
  }
  else
  {
    if(req.session.loginfail)
  {
    res.render("./users/login-page", { userhd: true,errorlogin:"Invalid Username or Password"});
    req.session.loginfail = false
  }
  else
  {
    res.render("./users/login-page");
  }
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
router.get("/otp",async(req,res)=>
{     
  if(req.session.otp)
  {
    res.render("./users/otp-page",{otperr:"Incorrect OTP Number"});
    req.session.otp = false
  }
  else
  {
    console.log(verifyotp);
     otp.Generate_Otp(verifyotp.ph).then((otp)=>
     {
         verifyotp.otp = otp;
         res.render('./users/otp-page',{userhd:true})
     })
     
  }
})
router.post("/otp",(req,res)=>
{
    if(verifyotp.otp == req.body.otp)
    {
      res.redirect("/login")
    }
    else
    {
      req.session.otp = true;
      res.redirect("/otp");
    }
})
router.get("/reqcontract",verfyuserlogin,(req,res)=>
{
  console.log(req.session.user._id,req.query.wktype);
    usebase.Check_Whethet_the_Contract_already_commited_or_Not(req.session.user._id,req.query.wktype).then((reqexist)=>
    {
      console.log(reqexist);
        if(reqexist)
        {
          usebase.Check_whether_The_admin_accepted_ThatRequest_OR_NoT(req.session.user._id,reqexist._id).then((accepted)=>
          {
            if(accepted)
            {
              res.render('./users/contract-page',{userhd:true,user:req.session.user,reqexist,accepted})
            }
            else
          {
            res.render('./users/contract-page',{userhd:true,user:req.session.user,reqexist})
          } 
          })
        }
        else
        {
          res.render('./users/contract-page',{userhd:true,user:req.session.user})  
        }
    })
})
router.post("/reqcontract",verfyuserlogin,(req,res)=>
{
   //console.log(req.session);
   req.body.userid = objectId(req.session.user._id);
   req.body.wktype = req.query.wktype;
   req.body.ctaccept = false
   req.body.empno = Number(req.body.empno);
  req.body.salary = Number(req.body.salary);
  req.body.isfull = false
   usebase.User_Contract_info_FOR_acceptecnce(req.body).then((info)=>
   {
        res.redirect('/reqcontract')
   })

})
module.exports = router;