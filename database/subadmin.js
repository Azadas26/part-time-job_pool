var promise = require("promise");
var db = require("../connection/connect");
var consts = require("../connection/consts");
var objectId = require("mongodb").ObjectId;
var bcrypt = require("bcryptjs");

module.exports = {
  Do_Admin_Login: (info) => {
    var state = {
      user: null,
      status: false,
    };
    return new promise((resolve, reject) => {
      db.get()
        .collection(consts.subadmin)
        .findOne({ name: info.name })
        .then((data) => {
          if (data) {
            if (info.password == data.password) {
              state.user = data;
              state.status = true;
              // console.log(state);
              resolve(state);
            } else {
              resolve({ status: false });
            }
          } else {
            resolve({ status: false });
          }
        });
    });
  },
  Shoew_Worker_Users_AND_accept_OR_reJect: (dis) => {
    return new promise(async (resolve, reject) => {
      var users = await db
        .get()
        .collection(consts.workertmp)
        .find({ district: dis })
        .toArray();
      resolve(users);
    });
  },
  Accept_Workers_signup: (info) => {
    return new promise(async (resolve, reject) => {
      info.password = await bcrypt.hash(info.password, 10);
      // console.log("Hello");
      db.get()
        .collection(consts.workerbase)
        .insertOne(info)
        .then((data) => {
          //console.log(data);
          resolve(info);
        });
    });
  },
  Remove_accepted_Workers_FROM_teMp: (id) => {
    return new promise((resolve, reject) => {
      db.get()
        .collection(consts.workertmp)
        .deleteOne({ _id: objectId(id) })
        .then((res) => {
          resolve(res);
        });
    });
  },
  Shoew_Hiree_Users_AND_accept_OR_reJect: () => {
    return new promise(async (resolve, reject) => {
      var users = await db.get().collection(consts.hireetmp).find().toArray();
      resolve(users);
    });
  },
  Accept_Hirees_signup: (info) => {
    return new promise(async (resolve, reject) => {
      info.password = await bcrypt.hash(info.password, 10);
      // console.log("Hello");
      db.get()
        .collection(consts.hireebase)
        .insertOne(info)
        .then((data) => {
          //console.log(data);
          resolve(info);
        });
    });
  },
  Remove_accepted_Hirees_FROM_teMp: (id) => {
    return new promise((resolve, reject) => {
      db.get()
        .collection(consts.hireetmp)
        .deleteOne({ _id: objectId(id) })
        .then((res) => {
          resolve(res);
        });
    });
  },
  List_Number_OF_contract_Reqyest_from_USeRs: (district) => {
    return new promise(async (resolve, reject) => {
      var ctr = await db
        .get()
        .collection(consts.userContractdb)
        .aggregate([
          {
            $match: {
              district: district,
              ctaccept: false,
            },
          },
          {
            $lookup: {
              from: consts.userbase,
              localField: "userid",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $project: {
              sname: 1,
              lno: 1,
              address: 1,
              district: 1,
              late: 1,
              long: 1,
              empno: 1,
              salary: 1,
              stime: 1,
              entim: 1,
              sdate: 1,
              edate: 1,
              userid: 1,
              wktype: 1,
              ctaccept: 1,
              user: {
                $arrayElemAt: ["$user", 0],
              },
            },
          },
        ])
        .toArray();
      //console.log(ctr);
      resolve(ctr);
    });
  },
  Accept_user_Jobequest_AND_Notify_WorkerS: (wkid, userid) => {
    console.log(wkid, userid);
    return new promise((resolve, reject) => {
      db.get()
        .collection(consts.userContractdb)
        .updateOne(
          { _id: objectId(wkid), userid: objectId(userid) },
          {
            $set: {
              ctaccept: true,
            },
          }
        )
        .then((res) => {
          resolve(res);
        });
    });
  },
  Get_WorkS_and_Today_Worker_Details: () => {
    return new promise(async (resolve, reject) => {
      var wrk = await db
        .get()
        .collection(consts.assignjob)
        .aggregate([
          {
            $unwind: "$workers",
          },
          {
            $lookup: {
              from: consts.userContractdb,
              localField: "wkid",
              foreignField: "_id",
              as: "wkinfo",
            },
          },
          {
            $project: {
              userid: 1,
              workers: 1,
              wkinfo: {
                $arrayElemAt: ["$wkinfo", 0],
              },
            },
          },
          {
            $lookup: {
              from: consts.userbase,
              localField: "userid",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $project: {
              workerid: "$workers.workerid",
              wkinfo: 1,
              userinfo: {
                $arrayElemAt: ["$user", 0],
              },
            },
          },
          {
            $lookup: {
              from: consts.workerbase,
              localField: "workerid",
              foreignField: "_id",
              as: "worker",
            },
          },
          {
            $project: {
              wkinfo: 1,
              userinfo: 1,
              wrkerinfo: {
                $arrayElemAt: ["$worker", 0],
              },
            },
          },
        ])
        .toArray();
      resolve(wrk);
    });
  },
  Reverse_the_current_active_Workers: (id) => {
    return new promise(async (resolve, reject) => {
      var info = await db
        .get()
        .collection(consts.assignjob)
        .aggregate([
          {
            $match: {
              _id: objectId(id),
            },
          },
          {
            $set: {
              workers: { $reverseArray: "$workers" },
            },
          },
          {
            $out: consts.assignjob,
          },
        ])
        .toArray();
      resolve(info);
    });
  },
  View_Current_Running_Works_and_user: () => {
    return new promise(async (resolve, reject) => {
      var wrk = await db
        .get()
        .collection(consts.userContractdb)
        .aggregate([
          {
            $lookup: {
              from: consts.userbase,
              localField: "userid",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $project: {
              _id: 1,
              sname: 1,
              lno: 1,
              address: 1,
              district: 1,
              late: 1,
              long: 1,
              empno: 2,
              salary: 400,
              stime: 1,
              entim: 1,
              sdate: 1,
              edate: 1,
              userid: 1,
              wktype: 1,
              ctaccept: 1,
              isfull: 1,
              pay: 1,
              isreqpay:1,
              wkinfo: {
                $arrayElemAt: ["$user", 0],
              },
            },
          },
          // {
          //   $lookup: {
          //     from: consts.userbase,
          //     localField: "userid",
          //     foreignField: "_id",
          //     as: "userinfo",
          //   },
          // },
          // {
          //   $project: {
          //     userid: 1,
          //     wkinfo: 1,
          //     userinfo: {
          //       $arrayElemAt: ["$userinfo", 0],
          //     },
          //   },
          // },
        ])
        .toArray();
      // console.log(wrk);
      resolve(wrk);
    });
  },
  Get_worhers_that_are_under_current_Running_work: (userid, wkid) => {
    return new promise(async (resolve, reject) => {
      var workers = await db
        .get()
        .collection(consts.assignjob)
        .aggregate([
          {
            $match: {
              userid: objectId(userid),
              wkid: objectId(wkid),
            },
          },
          {
            $unwind: "$workers",
          },
          {
            $project: {
              wkerid: "$workers.workerid",
            },
          },
          {
            $lookup: {
              from: consts.workerbase,
              localField: "wkerid",
              foreignField: "_id",
              as: "workerinfo",
            },
          },
          {
            $project: {
              workerinfo: {
                $arrayElemAt: ["$workerinfo", 0],
              },
            },
          },
        ])
        .toArray();
      resolve(workers);
    });
  },
  PayMent_request_TO_User_Message: (userid, wkid) => {
    return new promise((resolve, reject) => {
      db.get()
        .collection(consts.messagedb)
        .findOne({ userid: objectId(userid), wkid: objectId(wkid) })
        .then(async (res) => {
          var pay = {
            msg: null,
            reqpay: true,
          };
          if (res) {
            await db
              .get()
              .collection(consts.userContractdb)
              .findOne({ userid: objectId(userid), _id: objectId(wkid) })
              .then((info) => {
                const startDate = new Date(info.sdate);
                const endDate = new Date(info.edate);

                const differenceMs = endDate - startDate;

                const daysDifference =
                  Math.floor(differenceMs / (1000 * 60 * 60 * 24)) + 1;
                var total = daysDifference * info.empno * info.salary;
                pay.msg = "Please Pay " + total + " To Complete Job Recruitment";
                //console.log("Total Amount is"+pay.amount);
              });
            await db
              .get()
              .collection(consts.messagedb)
              .updateOne(
                { userid: objectId(userid), wkid: objectId(wkid) },
                {
                  $push: {
                    info: pay,
                  },
                }
              )
              .then((resc) => {
                resolve(resc);
              });
          } else {
            await db
              .get()
              .collection(consts.userContractdb)
              .findOne({ userid: objectId(userid), _id: objectId(wkid) })
              .then((info) => {
                const startDate = new Date(info.sdate);
                const endDate = new Date(info.edate);

                const differenceMs = endDate - startDate;

                const daysDifference =
                  Math.floor(differenceMs / (1000 * 60 * 60 * 24)) + 1;

                var total = daysDifference * info.empno * info.salary;
                pay.msg =
                  "Please Pay " + total + " To Complete Job Recruitment";
                // console.log("Total Amount is"+pay.amount);
              });
            var msg = {
              userid: objectId(userid),
              wkid: objectId(wkid),
              info: [pay],
            };
            db.get()
              .collection(consts.messagedb)
              .insertOne(msg)
              .then((res) => {
                resolve(res);
              });
          }
        });
    });
  },
  Blurr_Payment_request_After_admin_requesting: (userid, wkid) => {
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(consts.userContractdb)
        .updateOne(
          { userid: objectId(userid), _id: objectId(wkid) },
          {
            $set: {
              isreqpay: true,
            },
          }
        )
        .then((resc) => {
          resolve(resc);
        });
    });
  },
  If_SUB_admin_accept_job_Contractrequest_Notify_Is_accept: (wkid, userid) => {
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(consts.messagedb)
        .findOne({ _id: objectId(wkid), userid: objectId(userid) })
        .then(async (info) => {
          var infos = {
            msg: "Your Contract Request Accepted Waiting For Payment Request And Final Ckeck <br><h3>Have A Good Day </h3>",
          };
          if (info) {
            await db
              .get()
              .collection(consts.messagedb)
              .updateOne(
                { userid: objectId(userid), wkid: objectId(wkid) },
                {
                  $push: {
                    info: infos,
                  },
                }
              )
              .then((resc) => {
                resolve(resc);
              });
          } else {
            var status = {
              userid: objectId(userid),
              wkid: objectId(wkid),
              viewed:false,
              info: [infos],
            };
            db.get()
              .collection(consts.messagedb)
              .insertOne(status)
              .then((res) => {
                resolve(res);
              });
          }
        });
    });
  },
};
