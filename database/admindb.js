var promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts') 
var objectId = require('mongodb').ObjectId
var bcrypt = require('bcryptjs')

module.exports =
{
    Do_Admin_Login : (info)=>
    {
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.adminbase).findOne({name:info.name}).then((data)=>
            {
                if(data)
                {
                    
                    if(info.password==data.password )
                    {
                        console.log("Helloo",data);
                        resolve(true)

                    }
                    else
                    {
                        reject(true)
                    }
                }
                else
                {
                    reject(true)
                }
            })
        })
    },
    // Shoe_Normal_Users_AND_accept_OR_reJect : ()=>
    // {
    //     return new promise(async(resolve,reject)=>
    //     {
    //         var users =await db.get().collection(consts.usertemp).find().toArray()
    //         resolve(users)
    //     })
    // },
    // Accept_user_signup : (info)=>
    // {
    //     return new promise(async(resolve,reject)=>
    //     {
    //         info.password =await bcrypt.hash(info.password,10)
    //         console.log("Hello");
    //         db.get().collection(consts.userbase).insertOne(info).then((data)=>
    //         {
    //             //console.log(data);
    //             resolve(info)
    //         })
    //     })
    // },
    // Remove_accepted_user_FROM_teMp : (id)=>
    // {
    //         return new promise((resolve,reject)=>
    //         {
    //             db.get().collection(consts.usertemp).deleteOne({_id:objectId(id)}).then((res)=>
    //             {
    //                 resolve(res)
    //             })
    //         })
    // },
    Shoew_Worker_Users_AND_accept_OR_reJect : ()=>
    {
        return new promise(async(resolve,reject)=>
        {
            var users =await db.get().collection(consts.workertmp).find().toArray()
            resolve(users)
        })
    },
    Accept_Workers_signup : (info)=>
    {
        return new promise(async(resolve,reject)=>
        {
            info.password =await bcrypt.hash(info.password,10)
           // console.log("Hello");
            db.get().collection(consts.workerbase).insertOne(info).then((data)=>
            {
                //console.log(data);
                resolve(info)
            })
        })
    },
    Remove_accepted_Workers_FROM_teMp : (id)=>
    {
            return new promise((resolve,reject)=>
            {
                db.get().collection(consts.workertmp).deleteOne({_id:objectId(id)}).then((res)=>
                {
                    resolve(res)
                })
            })
    },
    Shoew_Hiree_Users_AND_accept_OR_reJect : ()=>
    {
        return new promise(async(resolve,reject)=>
        {
            var users =await db.get().collection(consts.hireetmp).find().toArray()
            resolve(users)
        })
    },
    Accept_Hirees_signup : (info)=>
    {
        return new promise(async(resolve,reject)=>
        {
            info.password =await bcrypt.hash(info.password,10)
           // console.log("Hello");
            db.get().collection(consts.hireebase).insertOne(info).then((data)=>
            {
                //console.log(data);
                resolve(info)
            })
        })
    },
    Remove_accepted_Hirees_FROM_teMp : (id)=>
    {
            return new promise((resolve,reject)=>
            {
                db.get().collection(consts.hireetmp).deleteOne({_id:objectId(id)}).then((res)=>
                {
                    resolve(res)
                })
            })
    },
}