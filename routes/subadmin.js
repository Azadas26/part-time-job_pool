var express = require('express');
var router = express.Router();
var subadmindb = require('../database/subadmin')
var objectId = require('mongodb').ObjectId

var verfysubadmin = (req,res,next)=>
{
    if(req.session.subadmin)
    {
        next()
    }   
    else
    {
        res.redirect("/subadmin/login")
    }
}
/* GET users listing. */
router.get('/',verfysubadmin,function(req, res, next) {
   res.render('./subadmin/first-page',{suba:true,user:req.session.subadmin})
});
router.get("/login",(req,res)=>
{   
    if(req.session.subadminfaild)
    {
      res.render("./subadmin/login-page",{errorlogin:"Invalid Username or Password"});
      req.session.subadminfaild = false
    }
    else
    {
      res.render("./subadmin/login-page")
    }
   
})
router.post("/login",(req,res)=>
{
 // console.log(req.body);
    subadmindb.Do_Admin_Login(req.body).then((state)=>
    {
        //console.log(state);
       if(state.status)
       {
        req.session.subadmin = state.user
        res.redirect("/subadmin")
       }
       else
       {
        req.session.subadminfaild = true;
        res.redirect("/subadmin/login")
       }
    })
})
router.get("/logout",(req,res)=>
{
   req.session.sunadmin= null;
   res.redirect("/subadmin/login")
})
router.get('/acceptworkers',verfysubadmin,(req,res)=>
{
     subadmindb.Shoew_Worker_Users_AND_accept_OR_reJect(req.session.subadmin.district).then((users)=>
     {
         res.render('./subadmin/accept-workers',{admin:true,users})
     })
})
router.post("/acceptworkers",(req,res)=>
{
   req.body.wkid = objectId(req.query.id);
   subadmindb.Accept_Workers_signup(req.body).then((data)=>
   {
       subadmindb.Remove_accepted_Workers_FROM_teMp(req.query.id).then((resc)=>
       {
         res.redirect("/subadmin/acceptworkers")
       })
   })
})
router.get("/removeacceptwk",(req,res)=>
{
   subadmindb.Remove_accepted_Workers_FROM_teMp(objectId(req.query.id)).then((resc)=>
   {
    res.redirect("/subadmin/acceptworkers")
   })
})
router.get("/acceptcontractrequest",(req,res)=>
{
  console.log("Called");
    subadmindb.List_Number_OF_contract_Reqyest_from_USeRs(req.session.subadmin.district).then((ctr)=>
    {
        res.render('./subadmin/user-contractreq',{suba:true,user:req.session.subadmin,ctr})
    })
})
router.get("/recruitment",(req,res)=>
{
    subadmindb.Accept_user_Jobequest_AND_Notify_WorkerS(req.query.jobid,req.query.userid).then((resc)=>
    {
         res.redirect("/subadmin/acceptcontractrequest")
    })
})

module.exports = router;
