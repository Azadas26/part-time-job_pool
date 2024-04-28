var express = require("express");
var router = express.Router();
var usebase = require("../database/userdb");
const twilio = require("twilio");
var otp = require('../connection/otp')
var objectId = require('mongodb').ObjectId

var total

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
    usebase.is_Notificaton_available_or_not(req.session.user._id).then((notification)=>
    {
      console.log(notification);
      if(notification)
      {
        res.render("./users/first-page", { userhd: true,user:req.session.user,notify:true});
      }
      else
      {
        res.render("./users/first-page", { userhd: true,user:req.session.user});
      }
      
    })
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
    res.render("./users/login-page", { errorlogin:"Invalid Username or Password"});
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
            usebase.Check_whether_The_Recrutment_process_Done_or_NOt(req.session.user._id,req.query.wktype).then((isfull)=>
            {
               if(isfull)
               {
                res.render('./users/contract-page',{userhd:true,user:req.session.user,reqexist,isfull})
               }
               else
               {
                if(accepted)
                {
                  res.render('./users/contract-page',{userhd:true,user:req.session.user,reqexist,accepted})
                }
                else
                {
                res.render('./users/contract-page',{userhd:true,user:req.session.user,reqexist})
                } 
               }
            })
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
  req.body.pay = false;
  req.body.isreqpay = false;
  req.body.time1 = true;
  req.body.time2 = false;
  req.body.replywk = true;
  req.body.firstwrkmsg = true;
   usebase.User_Contract_info_FOR_acceptecnce(req.body).then((info)=>
   {
        res.redirect('/reqcontract')
   })

})
router.get('/notification',verfyuserlogin,(req,res)=>
{
    usebase. Get_all_Notifications(req.session.user._id).then((nots)=>
    {
      usebase.Turn_off_notification_whe_user_already_viwed(req.session.user._id).then(()=>
      {
         if(nots[0])
         {
          console.log(nots);
          if(nots[0].payed)
          {
            res.render('./users/notification-page',{userhd:true,user:req.session.user,nots,pay:nots[0]})
          }
          else
          {
            res.render('./users/notification-page',{userhd:true,user:req.session.user,nots})
          }
         }
         else
         {
          res.render('./users/notification-page',{userhd:true,user:req.session.user})
         }
       
      }) 
      
    })
})
router.get('/payform',verfyuserlogin,(req,res)=>
{
    
   usebase.Get_information_For_Payment_Form(req.session.user._id,req.query.wkid).then((info)=>
   {
      console.log(info);
      usebase. Get_user_information_for_paymebt(req.session.user._id).then((userinfo)=>
      {
        console.log(userinfo);
        const startDate = new Date(info.sdate);
        const endDate = new Date(info.edate);
        const differenceMs = endDate - startDate;
  
        const daysDifference = Math.floor(differenceMs / (1000 * 60 * 60 * 24)) + 1;
        var total_amount = daysDifference * info.empno * info.salary
        console.log(total_amount);
         total = total_amount
        res.render('./users/payment-form',{userhd:true,user:req.session.user,info,total:total_amount,userinfo})
      })
   })
})
router.get('/wrkinfo',verfyuserlogin,(req,res)=>
{    
    usebase.Get_Worke_AND_Worker_Details(req.session.user._id).then((info)=>
    {
      //console.log(info);
      //console.log(info[0].wkinfo.empno);
      var state = []
      var wkinfo = {}
      if(info[0] )
      {
           console.log("Hello",info)
           for(i=0;i<info[0].wkinfo.empno;i++)
           {
               state.push(info[i].workerinfo)
               wkinfo = info[i].wkinfo
           }
           //console.log(state);
           res.render('./users/wrk-info',{userhd:true,user:req.session.user,state,wkinfo})
      }
      else
      {
       ;
        res.render('./users/wrk-info',{userhd:true,user:req.session.user})
      }
       
    })
})
router.post('/payment',async(req,res)=>
{

      await usebase.generateRazorpay(req.body.wkid,total).then((response)=>
      {
         res.json(response)
      })
})
router.post('/verfy-pay',(req,res)=>
{
    console.log("findWork ID",req.body);
    usebase.verify_Payment(req.body).then(()=>
    {
       usebase.Change_state_of_pay_object_AFteR_Payment(req.body['order[receipt]'],req.session.user._id).then(()=>
       {
            usebase. Change_state_of_payedobject_in_users_notify(req.session.user._id,req.body['order[receipt]']).then(()=>
            {
              res.json({status:true})
            })       
       })

    }).catch(()=>
    {
        res.json({status:'Payment Failed'})
    })
})
router.get('/afterplaced',(req,res)=>
{
    res.render('./users/success-page',{userhd:true,user:req.session.user})
})
router.get('/about',(req,res)=>
{
    res.render('./users/about-page',{userhd:true,user:req.session.user})
})
router.get('/deverr',verfyuserlogin,(req,res)=>
{
   res.render('./users/dev-err',{userhd:true,user:req.session.user})
})

module.exports = router;