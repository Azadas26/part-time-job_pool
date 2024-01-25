var express = require('express');
var router = express.Router();
var admindb = require('../database/admindb')
var objectId = require('mongodb').ObjectId

var verfyadmin = (req,res,next)=>
{
    if(req.session.admin)
    {
        next()
    }   
    else
    {
        res.redirect("/admin/login")
    }
}
/* GET users listing. */
router.get('/',verfyadmin,function(req, res, next) {
   res.render('./admin/first-page',{admin:true,user:req.session.admin})
});
router.get("/login",(req,res)=>
{   
    if(req.session.adminfaild)
    {
      res.render("./admin/login-page",{errorlogin:"Invalid Username or Password"});
      req.session.adminfaild = false
    }
    else
    {
      res.render("./admin/login-page")
    }
   
})
router.post("/login",(req,res)=>
{
  console.log("admin");
    admindb.Do_Admin_Login(req.body).then((data)=>
    {
        req.session.admin = "admin"
        res.redirect("/admin")
    }).catch((info)=>
    {
        req.session.adminfaild = true;
        res.redirect("/admin/login")
    })
})
router.get("/logout",(req,res)=>
{
   req.session.admin= null;
   res.redirect("/admin/login")
})
// router.get('/acceptuser',(req,res)=>
// {
//      admindb.Shoe_Normal_Users_AND_accept_OR_reJect().then((users)=>
//      {
//          res.render('./admin/normal-users',{admin:true,users})
//      })
// })
// router.post("/acceptuser",(req,res)=>
// {
//    req.body.userid = objectId(req.query.id);
//    admindb.Accept_user_signup(req.body).then((data)=>
//    {
//        admindb.Remove_accepted_user_FROM_teMp(req.query.id).then((resc)=>
//        {
//          res.redirect("/admin/acceptuser")
//        })
//    })
// })
// router.get("/removeaccept",(req,res)=>
// {
//    admindb.Remove_accepted_user_FROM_teMp(objectId(req.query.id)).then((resc)=>
//    {
//     res.redirect("/admin/acceptuser")
//    })
// })
router.get('/acceptworkers',(req,res)=>
{
     admindb.Shoew_Worker_Users_AND_accept_OR_reJect().then((users)=>
     {
         res.render('./admin/accept-workers',{admin:true,users})
     })
})
router.post("/acceptworkers",(req,res)=>
{
   req.body.wkid = objectId(req.query.id);
   admindb.Accept_Workers_signup(req.body).then((data)=>
   {
       admindb.Remove_accepted_Workers_FROM_teMp(req.query.id).then((resc)=>
       {
         res.redirect("/admin/acceptworkers")
       })
   })
})
router.get("/removeacceptwk",(req,res)=>
{
   admindb.Remove_accepted_Workers_FROM_teMp(objectId(req.query.id)).then((resc)=>
   {
    res.redirect("/admin/acceptworkers")
   })
})
router.get('/accepthiree',(req,res)=>
{
     admindb.Shoew_Hiree_Users_AND_accept_OR_reJect().then((users)=>
     {
         res.render('./admin/accept-hiree',{admin:true,users})
     })
})
router.post("/accepthiree",(req,res)=>
{
   req.body.hireeid = objectId(req.query.id);
   admindb.Accept_Hirees_signup(req.body).then((data)=>
   {
       admindb.Remove_accepted_Hirees_FROM_teMp(req.query.id).then((resc)=>
       {
         res.redirect("/admin/accepthiree")
       })
   })
})
router.get("/removeaccepthi",(req,res)=>
{
   admindb.Remove_accepted_Hirees_FROM_teMp(objectId(req.query.id)).then((resc)=>
   {
    res.redirect("/admin/accepthiree")
   })
})
module.exports = router;
