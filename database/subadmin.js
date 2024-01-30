var promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts') 
var objectId = require('mongodb').ObjectId
var bcrypt = require('bcryptjs')

module.exports =
{
    Do_Admin_Login : (info)=>
    {
        var state =
            {
                user:null,
                status : false
            }
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.subadmin).findOne({name:info.name}).then((data)=>
            {
                if(data)
                {
                    
                    if(info.password==data.password )
                    {
                        state.user= data
                        state.status = true
                       // console.log(state);
                        resolve(state)

                    }
                    else
                    {
                        resolve({status:false})
                    }
                }
                else
                {
                    resolve({status:false})
                }
            })
        })
    },
    Shoew_Worker_Users_AND_accept_OR_reJect : (dis)=>
    {
        return new promise(async(resolve,reject)=>
        {
            var users =await db.get().collection(consts.workertmp).find({district:dis}).toArray()
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
    List_Number_OF_contract_Reqyest_from_USeRs : (district)=>
    {
        return new promise(async(resolve,reject)=>
        {
            var ctr =await db.get().collection(consts.userContractdb).aggregate([
                {
                    $match:
                    {
                        district:district,
                        ctaccept:false
                    }
                },
                {
                    $lookup:
                    {
                        from: consts.userbase,
                        localField: "userid",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $project:
                    {
                        sname : 1,
                        lno : 1,
                        address : 1,
                        district : 1,
                        late : 1,
                        long : 1,
                        empno : 1,
                        salary : 1,
                        stime : 1,
                        entim : 1,
                        sdate : 1,
                        edate : 1,
                        userid : 1,
                        wktype : 1,
                        ctaccept : 1,
                        user:
                        {
                            $arrayElemAt: ['$user', 0]
                        }
                    }
                }
            ]).toArray()
            //console.log(ctr);
            resolve(ctr)
        })
    },
    Accept_user_Jobequest_AND_Notify_WorkerS : (wkid,userid)=>
    {
        console.log(wkid,userid);
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.userContractdb).updateOne({_id:objectId(wkid),userid:objectId(userid)},
            {
                $set:
                {
                    ctaccept:true
                }
            }).then((res)=>
            {
                resolve(res)
            })
        })
    }
}