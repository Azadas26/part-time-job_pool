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
router.get('/reversewrker',(req,res)=>
{
        console.log(req.query.id);
        subadmindb. Reverse_the_current_active_Workers(req.query.id).then((resc)=>
        {
            res.redirect('/subadmin/activewrkers')
        })
})
router.get('/activeworks',(req,res)=>
{
    subadmindb.View_Current_Running_Works_and_user().then((wrk)=>
    {
        console.log(wrk);
        res.render('./subadmin/active-works',{suba:true,user:req.session.subadmin,wrk})
    })
})
router.get("/activewrkers",(req,res)=>
{
    console.log(req.query);
    subadmindb.Get_WorkS_and_Today_Worker_Details().then(async(wrks)=>
    {
         var date = require('../connection/date')
       
        const wrk = wrks.slice(0, parseInt(wrks[0].wkinfo.empno));
        console.log(wrk[0]);
        var today = new Date()
        date.date_Between_StartAnd_End(wrk[0].wkinfo.sdate,wrk[0].wkinfo.edate,today.toISOString().split('T')[0]).then((contractdate)=>
        {
            res.render('./subadmin/activework-moreinfo',{suba:true,user:req.session.subadmin,wrk,rev:wrk[0],datebetween:contractdate})
        }).catch((contractdate)=>
        {
            //console.log(contractdate);
           if(contractdate)
           {
            res.render('./subadmin/activework-moreinfo',{suba:true,user:req.session.subadmin,wrk,rev:wrk[0],datealreadyend:contractdate})
           }
           else
           {
            res.render('./subadmin/activework-moreinfo',{suba:true,user:req.session.subadmin,wrk,rev:wrk[0],datenotreached:true})
           }
        })
       
    })
    
})

module.exports = router;
