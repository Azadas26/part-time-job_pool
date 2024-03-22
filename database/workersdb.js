var promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts') 
var bcrypt = require('bcryptjs')
var objectId = require('mongodb').ObjectId

module.exports=
{
    Do_signup : (info)=>
    {
        return new promise(async(resolve,reject)=>
        {
          
            db.get().collection(consts.workertmp).insertOne(info).then((data)=>
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
            db.get().collection(consts.workerbase).findOne({email:email}).then((email)=>
            {
                resolve(email);
            })
        })
    },
    Check_Whether_The_AaDhar_is_EXIST_or_not : (info)=>
    {
            return new promise((resolve,reject)=>
            {
                db.get().collection(consts.workerbase).findOne({aadhar:info.aadhar}).then((aadhar)=>
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
            db.get().collection(consts.workerbase).findOne({email:info.email}).then((data)=>
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
    View_available_Jobs : ()=>
    {
        return new promise((resolve,reject)=>
        {
            var jobs = db.get().collection(consts.userContractdb).find({pay:true}).toArray()
            resolve(jobs)
        })
        
    },
    Assign_Worker_to_Their_Redy_To_join : (wkid,userid,workerid,dates)=>
    {
        return new promise((resolve,reject)=>
        {   
            db.get().collection(consts.assignjob).findOne({wkid:objectId(wkid),userid:objectId(userid)}).then(async(res)=>
            {
                var wrk =
                {
                    workerid : objectId(workerid),
                    preferredDates: dates && Array.isArray(dates) ? dates.map(date => new Date(date)) : null
                }
                if(res)
                {
                    var st = res.workers.findIndex(wks => wks.workerid == workerid)
                    
                    console.log(st);
                    if(st === -1)
                    {
                        
                        await db.get().collection(consts.assignjob).updateOne({ userid: objectId(userid),wkid:objectId(wkid) },
                        {
                            $push:
                            {
                               workers:wrk
                            }
                        }).then((data) => {
                            resolve(false)
                        })
                    }
                    else
                    {
                        resolve(true)
                    }

                }
                else
                {
                   var wk =
                   {
                     wkid:objectId(wkid),
                     userid:objectId(userid),
                     workers:[wrk]
                   }
                    db.get().collection(consts.assignjob).insertOne(wk).then((resc)=>
                    {
                        resolve(false)
                    })
                }
            })
        })
    },
    Evaluvate_The_Worker_Count_CompairWithDate_andCount:(userid,wkid)=>
    {
        return new promise((resolve,reject)=>
        {
            db.get().collection(consts.userContractdb).findOne({userid:objectId(userid),_id:objectId(wkid)}).then((res)=>
            {
                //console.log(res);
                const startDate = new Date(res.sdate);
                const endDate = new Date(res.edate);
                // Calculate the difference in milliseconds
                const timeDifference = endDate - startDate;
                // Convert milliseconds to days
                const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))+1;
                var maxemp = daysDifference * res.empno
                console.log(maxemp);
                db.get().collection(consts.assignjob).findOne({userid:objectId(userid),wkid:objectId(wkid)}).then((wrkinfo)=>
                {
                  console.log("Array Length",wrkinfo);
                  if(wrkinfo)
                  {
                    if(maxemp > (wrkinfo.workers.length+1))
                    {
                         resolve(false)
                         resolve(false)
                         db.get().collection(consts.userContractdb).updateOne({userid:objectId(userid),_id:objectId(wkid)},
                         {
                            $set:
                            {
                                isfull:false
                            }
                         })
                    }
                    else
                    {
                         resolve(true)
                         resolve(false)
                         db.get().collection(consts.userContractdb).updateOne({userid:objectId(userid),_id:objectId(wkid)},
                         {
                            $set:
                            {
                                isfull:true
                            }
                         })
                    }
                  }
                  else
                  {
                    resolve(false)
                  }

                })


            })
        })
    }
}