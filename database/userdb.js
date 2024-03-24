var promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts') 
var bcrypt = require('bcryptjs')
var objecTId = require('mongodb').ObjectId

module.exports=
{
    Do_signup : (info)=>
    {
        return new promise(async(resolve,reject)=>
        {
          
            info.password =await bcrypt.hash(info.password,10);
            db.get().collection(consts.userbase).insertOne(info).then((data)=>
            {
                //console.log(data);
                resolve(data.ops[0]._id)
            })
        })
    },
    Ckeck_whether_the_user_is_exist_or_NOt : (email)=>
    {
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.userbase).findOne({email:email}).then((email)=>
            {
                resolve(email);
            })
        })
    },
    Check_Whether_The_AaDhar_is_EXIST_or_not : (info)=>
    {
            return new promise((resolve,reject)=>
            {
                db.get().collection(consts.userbase).findOne({aadhar:info.aadhar}).then((aadhar)=>
                {
                    resolve(aadhar)
                })
            })
    },
    Do_login : (info)=>
    {
        return new promise((resolve,reject)=>
        {
            var state =
            {
                user:null,
                status : false
            }
            db.get().collection(consts.userbase).findOne({email:info.email}).then((data)=>
            {
               if(data)
               {
                bcrypt.compare(info.password,data.password).then((isexist)=>
                {
                    if(isexist)
                    {
                        state.user = data;
                        state.status = true
                        resolve(state)
                        console.log("Login success");
                    }  
                    else
                    {
                        resolve({state:false})
                        console.log("Login Faild");
                    }
                })
               }
               else
               {
                    resolve({state:false})
                    console.log("Login Faild");
               }
            })
        })
    },
    User_Contract_info_FOR_acceptecnce : (info)=>
    {
         return new promise((resolve,reject)=>
         {
             db.get().collection(consts.userContractdb).insertOne(info).then((res)=>
             {
                resolve(res)
             })
         })
    },
    Check_Whethet_the_Contract_already_commited_or_Not : (userid,wktype)=>
    {
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.userContractdb).findOne({userid:objecTId(userid),wktype:wktype}).then((res)=>
            {
                resolve(res)
            })
        })
    },
    Check_whether_The_admin_accepted_ThatRequest_OR_NoT : (userid,wkid)=>
    {
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.userContractdb).findOne({userid:objecTId(userid),_id:objecTId(wkid),ctaccept:true}).then((res)=>
            {
                resolve(res)
            })
        })
    },
    Get_all_Notifications : (userid)=>
    {
        return new promise(async(resolve,reject)=>
        {
            var notifications = await db.get().collection(consts.messagedb).aggregate(
                [
                    {
                        $match:
                        {
                            userid:objecTId(userid)
                        }
                    },
                    {
                        $unwind:"$info"
                    }
                ]
            ).toArray()
            console.log(notifications)
            resolve(notifications)
        })
    },
    is_Notificaton_available_or_not : (userid)=>
    {
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.messagedb).findOne({userid:objecTId(userid),viewed:false}).then((resc)=>
            {
                if(resc)
                {
                    resolve(true)
                }
                else
                {
                    resolve(false)
                }
            })
        })
    },
    Turn_off_notification_whe_user_already_viwed : (userid)=>
    {
        return new promise(async(resolve,reject)=>
        {
            await db.get().collection(consts.messagedb).updateOne({userid:objecTId(userid)},
            {
                $set:
                {
                    viewed : true
                }
            }).then(()=>
            {
                resolve()
            })
        })
    }
}