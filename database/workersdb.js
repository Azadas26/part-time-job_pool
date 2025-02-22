var promise = require('promise')
var db = require('../connection/connect')
var consts = require('../connection/consts')
var bcrypt = require('bcryptjs')
var objectId = require('mongodb').ObjectId

module.exports =
{
    Do_signup: (info) => {
        return new promise(async (resolve, reject) => {

            db.get().collection(consts.workertmp).insertOne(info).then((data) => {
                //console.log(data);
                resolve(data.ops[0]._id)
            })
        })
    },
    Ckeck_whether_the_user_is_exist_or_NOt: (email) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.workerbase).findOne({ email: email }).then((email) => {
                resolve(email);
            })
        })
    },
    Check_Whether_The_AaDhar_is_EXIST_or_not: (info) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.workerbase).findOne({ aadhar: info.aadhar }).then((aadhar) => {
                resolve(aadhar)
            })
        })
    },
    Do_login: (info) => {
        return new promise((resolve, reject) => {
            var state =
            {
                user: null,
                status: false
            }
            db.get().collection(consts.workerbase).findOne({ email: info.email }).then((data) => {
                if (data) {
                    bcrypt.compare(info.password, data.password).then((isexist) => {
                        if (isexist) {
                            state.user = data;
                            state.status = true
                            resolve(state)
                            console.log("Login success");
                        }
                        else {
                            resolve({ state: false })
                            console.log("Login Faild");
                        }
                    })
                }
                else {
                    resolve({ state: false })
                    console.log("Login Faild");
                }
            })
        })
    },
    View_available_Jobs: () => {
        return new promise(async(resolve, reject) => {
            var jobs =await db.get().collection(consts.userContractdb).find({ pay: true }).toArray()
            resolve(jobs)
            
        })

    },
    Assign_Worker_to_Their_Redy_To_join: (wkid, userid, workerid, dates) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.assignjob).findOne({ wkid: objectId(wkid), userid: objectId(userid) }).then(async (res) => {
                var wrk =
                {
                    workerid: objectId(workerid),
                    preferredDates: dates && Array.isArray(dates) ? dates.map(date => date) : null
                }
                if (res) {
                    var st = res.workers.findIndex(wks => wks.workerid == workerid)

                    console.log(st);
                    if (st === -1) {

                        await db.get().collection(consts.assignjob).updateOne({ userid: objectId(userid), wkid: objectId(wkid) },
                            {
                                $push:
                                {
                                    workers: wrk
                                }
                            }).then((data) => {
                                resolve(false)
                            })
                    }
                    else {
                        resolve(true)
                    }

                }
                else {
                    var wk =
                    {
                        wkid: objectId(wkid),
                        userid: objectId(userid),
                        workers: [wrk]
                    }
                    db.get().collection(consts.assignjob).insertOne(wk).then((resc) => {
                        resolve(false)
                    })
                }
            })
        })
    },
    Evaluvate_The_Worker_Count_CompairWithDate_andCount: (userid, wkid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.userContractdb).findOne({ userid: objectId(userid), _id: objectId(wkid) }).then((res) => {
                //console.log(res);
                const startDate = new Date(res.sdate);
                const endDate = new Date(res.edate);
                // Calculate the difference in milliseconds
                const timeDifference = endDate - startDate;
                // Convert milliseconds to days
                const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
                var maxemp = daysDifference * res.empno
                console.log(maxemp);
                db.get().collection(consts.assignjob).findOne({ userid: objectId(userid), wkid: objectId(wkid) }).then((wrkinfo) => {
                    console.log("Array Length", wrkinfo);
                    if (wrkinfo) {
                        console.log("Aza Here", wrkinfo.workers.length + 1);
                        if (maxemp >= (wrkinfo.workers.length + 1)) {
                            resolve(false)
                            resolve(false)
                            db.get().collection(consts.userContractdb).updateOne({ userid: objectId(userid), _id: objectId(wkid) },
                                {
                                    $set:
                                    {
                                        isfull: false
                                    }
                                })
                        }
                        else {
                            resolve(true)
                            resolve(false)
                            db.get().collection(consts.userContractdb).updateOne({ userid: objectId(userid), _id: objectId(wkid) },
                                {
                                    $set:
                                    {
                                        isfull: true
                                    }
                                })
                        }
                    }
                    else {
                        resolve(false)
                    }

                })


            })
        })
    },
    Get_state_off_first_message_to_worker: (userid, wkid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.userContractdb).findOne({ userid: objectId(userid), _id: objectId(wkid) }).then((info) => {
                resolve(info.firstwrkmsg)
            })
        })
    },
    Update_state_off_first_message_to_worker: (userid, wkid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.userContractdb).updateOne({ userid: objectId(userid), _id: objectId(wkid) },
                {
                    $set:
                    {
                        firstwrkmsg: false
                    }
                }).then((resc) => {
                    resolve(resc)
                })
        })
    },
    GetWorKers_FOR_first_Message_To_first_no_OF_workers: (userid, wrkid) => {
        return new promise(async (resolve, reject) => {
            var info = await db.get().collection(consts.assignjob).aggregate([
                {
                    $match:
                    {
                        userid: objectId(userid),
                        wkid: objectId(wrkid)
                    }
                },
                {
                    $unwind: "$workers"
                },
                {
                    $project:
                    {
                        userid: 1,
                        wkid: 1,
                        workers: 1,
                        date: "$workers.preferredDates"
                    }
                },
                {
                    $lookup: {
                        from: consts.userContractdb,
                        localField: "wkid",
                        foreignField: "_id",
                        as: "workerinfo",
                    }
                },
                {
                    $project: {
                        userid: 1,
                        wkid: 1,
                        workers: 1,
                        date: 1,
                        workerinfo: {
                            $arrayElemAt: ["$workerinfo", 0],
                        },
                    },
                },
            ]).toArray()
            //console.log(info);
            resolve(info);
        })
    },
    Check_whether_a_new_notification_Appear_Or_not: (userid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.wrknotify).findOne({ userid: objectId(userid) }).then((resc) => {
                resolve(resc)
            })
        })
    },
    If_worker_view_WrkMessage_change_object: (userid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.wrknotify).updateOne({ userid: objectId(userid) },
                {
                    $set:
                    {
                        notview: false
                    }
                }).then((resc) =>
                    [
                        resolve()
                    ])
        })
    },
    view_Work_notification_Befor_work_starting_to_each_selected_workers: (userid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.wrknotify).findOne({ userid: objectId(userid) }).then((resc) => {
                resolve(resc)
            })
        })
    },
    Check_whether_The_No_of_worker_already_full_in_a_referd_date_or_not: (date, number, userid, wkid) => {
        return new promise(async (resolve, reject) => {
            var objs =
            {
                state: [],
                isfull: false
            }
            console.log(date);
            if (date != null) {
                for (i = 0; i < date.length; i++) {
                    var datess = await db.get().collection(consts.assignjob).aggregate([
                        {
                            $match: {
                                "workers.preferredDates": date[i],
                                userid: objectId(userid),
                                wkid: objectId(wkid)

                            }
                        }
                    ]).toArray()
                    if (datess[0]) {
                        var get_workarray = datess[0].workers
                        //console.log(get_workarray);
                        function countWorkersWithPreferredDate(date) {
                            let count = 0;
                            get_workarray.forEach(worker => {
                                if (worker.preferredDates && worker.preferredDates.includes(date)) {
                                    count++;
                                }
                            });
                            return count;
                        }

                        // Call the function with the date "2024-04-25"
                        const numberOfWorkersWithDate = countWorkersWithPreferredDate(date[i]);
                        if (numberOfWorkersWithDate >= number) {
                            objs.state.push(`In This Date ${date[i]} Contain ${numberOfWorkersWithDate} Workers So The Maximum Number(${number}) Reached Select Another Date!`);
                            objs.isfull = true
                        }
                        else {
                            //state.push(`in ${date[i]} contain ${numberOfWorkersWithDate} Workers Limit is not reached (maximum limit ${number})`);
                        }

                    }
                    else {

                        //state.push(`${date[i]} is Fully free sloat `);
                    }
                }
            }
            else {

            }

            console.log(objs);
            resolve(objs);
        })
    },
    Get_No_of_emplee_User_Want_For_compairing_with_noOf_worker_dayBy_Day: (userid, wkid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.userContractdb).findOne({ userid: objectId(userid), _id: objectId(wkid) }).then((resc) => {
                resolve(resc)
            })
        })
    },
    Get_lates_isfull_OBJECT_for_worker_message: (userid, wrkid) => {
        return new promise((resolve, reject) => {
            db.get().collection(consts.userContractdb).findOne({ userid: objectId(userid), _id: objectId(wrkid) }).then((resc) => {
                resolve(resc.isfull)
            })
        })
    },
    Re_Arrange_workers_According_assending_order_of_the_date: (userid, wkid) => {
        return new promise(async (resolve, reject) => {
            var info = await db.get().collection(consts.assignjob).findOne({ userid: objectId(userid), wkid: objectId(wkid) })
            var data = info.workers
            data.sort((a, b) => {

                if (a.preferredDates === null && b.preferredDates !== null) {
                    return 1;
                } else if (a.preferredDates !== null && b.preferredDates === null) {
                    return -1;
                } else if (a.preferredDates !== null && b.preferredDates !== null) {

                    return new Date(a.preferredDates[0]) - new Date(b.preferredDates[0]);
                }
                return 0;
            });

            await db.get().collection(consts.assignjob).updateOne({ userid: objectId(userid), wkid: objectId(wkid) },
                {
                    $set:
                    {
                        workers: data
                    }
                }).then((resc) => {
                    resolve(resc)
                })
        })
    }
}