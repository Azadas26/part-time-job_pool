var promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts') 
var bcrypt = require('bcryptjs')

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
    }
}