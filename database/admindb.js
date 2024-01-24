var promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts') 
var objectId = require('mongodb').ObjectId
var bcrypt = require('bcryptjs')

module.exports =
{
    Shoe_Normal_Users_AND_accept_OR_reJect : ()=>
    {
        return new promise(async(resolve,reject)=>
        {
            var users =await db.get().collection(consts.usertemp).find().toArray()
            resolve(users)
        })
    },
    Accept_user_signup : (info)=>
    {
        return new promise(async(resolve,reject)=>
        {
            info.password =await bcrypt.hash(info.password,10)
            console.log("Hello");
            db.get().collection(consts.userbase).insertOne(info).then((data)=>
            {
                //console.log(data);
                resolve(info)
            })
        })
    },
    Remove_accepted_user_FROM_teMp : (id)=>
    {
            return new promise((resolve,reject)=>
            {
                db.get().collection(consts.usertemp).deleteOne({_id:objectId(id)}).then((res)=>
                {
                    resolve(res)
                })
            })
    }
}