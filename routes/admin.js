var express = require('express');
var router = express.Router();
var admindb = require('../database/admindb')
var objectId = require('mongodb').ObjectId

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/acceptuser',(req,res)=>
{
     admindb.Shoe_Normal_Users_AND_accept_OR_reJect().then((users)=>
     {
         res.render('./admin/normal-users',{admin:true,users})
     })
})
router.post("/acceptuser",(req,res)=>
{
   req.body.userid = objectId(req.query.id);
   admindb.Accept_user_signup(req.body).then((data)=>
   {
       admindb.Remove_accepted_user_FROM_teMp(req.query.id).then((resc)=>
       {
         res.redirect("/admin/acceptuser")
       })
   })
})
router.get("/removeaccept",(req,res)=>
{
   admindb.Remove_accepted_user_FROM_teMp(objectId(req.query.id)).then((resc)=>
   {
    res.redirect("/admin/acceptuser")
   })
})

module.exports = router;
