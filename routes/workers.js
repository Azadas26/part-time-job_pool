var express = require("express");
var router = express.Router();
var wrkbase = require("../database/workersdb");
const twilio = require("twilio");
var otp = require("../connection/otp");
var subadmindb = require("../database/subadmin");

/* GET home page. */
var wkverifyotp = {
  ph: null,
  otp: null,
};

var verifyworker = (req, res, next) => {
  if (req.session.wrker) {
    next();
  } else {
    res.redirect("/worker/login");
  }
};

router.get("/", function (req, res, next) {
  if (req.session.wrker) {
    wrkbase
      .Check_whether_a_new_notification_Appear_Or_not(req.session.wrker._id)
      .then((info) => {
        if (info) {
          if (info.notview) {
            res.render("./workers/first-page", {
              wk: true,
              user: req.session.wrker,
              notview: true,
            });
          } else {
            res.render("./workers/first-page", {
              wk: true,
              user: req.session.wrker,
            });
          }
        } else {
          console.log("hiiii");

          res.render("./workers/first-page", {
            wk: true,
            user: req.session.wrker,
          });
        }
      });
  } else {
    res.render("./workers/first-page", { wk: true });
  }
});
router.get("/signup", (req, res) => {
  if (req.session.wkemailexist) {
    res.render("./workers/signup-page", {
      emailexist: "This Email Address Already Exist!",
    });
    req.session.wkemailexist = false;
  } else if (req.session.wkaadharexist) {
    res.render("./workers/signup-page", {
      aadharexist: "This Aadhar Number Already Exist!",
    });
    req.session.wkaadharexist = false;
  } else {
    res.render("./workers/signup-page");
  }
});
router.post("/signup", (req, res) => {
  //console.log(req.body);
  wrkbase
    .Ckeck_whether_the_user_is_exist_or_NOt(req.body.email)
    .then((email) => {
      if (email) {
        req.session.wkemailexist = true;
        res.redirect("/worker/signup");
      } else {
        wrkbase
          .Check_Whether_The_AaDhar_is_EXIST_or_not(req.body)
          .then((aadhar) => {
            if (aadhar) {
              req.session.wkaadharexist = true;
              res.redirect("/worker/signup");
            } else {
              wrkbase.Do_signup(req.body).then(async (id) => {
                res.redirect("/worker/login");
                wkverifyotp.ph = req.body.ph;
                var image = req.files.image;
                req.body.proof = false;
                if (image) {
                  await image.mv(
                    "public/wkaadhar/" + id + ".jpg",
                    (err, data) => {
                      if (err) {
                        console.log(err);
                      }
                    }
                  );
                }
                var proof = req.files.proof;
                if (proof) {
                  req.body.proof = true;
                  await image.mv(
                    "public/workers-proof/" + id + ".jpg",
                    (err, data) => {
                      if (err) {
                        console.log(err);
                      }
                    }
                  );
                }
              });
            }
          });
      }
    });
});
router.get("/login", (req, res) => {
  if (req.session.wrker) {
    res.redirect("/worker/");
  } else {
    if (req.session.wkloginfail) {
      res.render("./workers/login-page", {
        errorlogin: "Invalid Username or Password",
      });
      req.session.wkloginfail = false;
    } else {
      res.render("./workers/login-page");
    }
  }
});
router.post("/login", (req, res) => {
  wrkbase.Do_login(req.body).then((state) => {
    if (state.status) {
      req.session.wrker = state.user;
      req.session.wrker.status = true;
      console.log(req.session.user);
      res.redirect("/worker/");
    } else {
      req.session.wkloginfail = true;
      res.redirect("/worker/login");
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.wrker = null;
  res.redirect("/worker//login");
});
router.get("/otp", async (req, res) => {
  if (req.session.wkotp) {
    res.render("./workers/otp-page", { otperr: "Incorrect OTP Number" });
    req.session.wkotp = false;
  } else {
    otp.Generate_Otp(wkverifyotp.ph).then((otp) => {
      wkverifyotp.otp = otp;
      res.render("./workers/otp-page", { wk: true });
    });
  }
});
router.post("/otp", (req, res) => {
  if (wkverifyotp.otp == req.body.otp) {
    res.redirect("/worker/login");
  } else {
    req.session.wkotp = true;
    res.redirect("/worker/otp");
  }
});
router.get("/applayjob", verifyworker, (req, res) => {
  wrkbase.View_available_Jobs().then((jobs) => {
    res.render("./workers/jobs-page", { wk: true, user: req.session.wrker, jobs, });
  });
});
router.post("/applayjob", verifyworker, async (req, res) => {
  var dateArray = null;
  console.log("Date", req.body);
  if (req.body.date == 'no') {
    console.log("NOO check");
    dateArray = null;
  }
  else {
    const preferredDates = req.body.preferredDates;
    //console.log(preferredDates);
    dateArray = preferredDates.split(", ").map((date) => date);
    //console.log(dateArray);
  }
  //console.log(dateArray);
  console.log(req.query.userid, req.query.wkid);

  await wrkbase.Get_No_of_emplee_User_Want_For_compairing_with_noOf_worker_dayBy_Day(req.query.userid, req.query.wkid).then(async (obj) => {
    //var date = req.body.date;
    //var datrarray=date.split(',');
    //console.log(obj.empno);
    await wrkbase.Check_whether_The_No_of_worker_already_full_in_a_referd_date_or_not(dateArray, obj.empno, req.query.userid, req.query.wkid).then((objs) => {
      //console.log(objs.isfull);

      if (objs.isfull) {
        wrkbase.View_available_Jobs().then((jobs) => {

          // console.log(objs.state);
          // console.log("Azad first");
          res.render("./workers/jobs-page", { wk: true, user: req.session.wrker, state: objs.state, jobs });
        });
      }
      else {
        //console.log("Azade secon");
        wrkbase.Evaluvate_The_Worker_Count_CompairWithDate_andCount(req.query.userid, req.query.wkid).then((fill) => {
          wrkbase.Assign_Worker_to_Their_Redy_To_join(req.query.wkid, req.query.userid, req.session.wrker._id, dateArray).then((resc) => {
            wrkbase.View_available_Jobs().then(async (jobs) => {
              //   // console.log(jobs);
              //console.log("i fills", fill);
              //console.log("obj..#####",obj);
              await wrkbase.Get_lates_isfull_OBJECT_for_worker_message(req.query.userid, req.query.wkid).then((fullornot) => {
                if (fullornot) {
                  console.log("Ting ting");
                  wrkbase.Get_state_off_first_message_to_worker(req.query.userid, req.query.wkid).then(async (resc) => {
                    if (resc) {
                      await wrkbase.GetWorKers_FOR_first_Message_To_first_no_OF_workers(req.query.userid, req.query.wkid).then(async (info) => {
                        var no_day = info[0].workerinfo.empno;
                        console.log(info);
                        await wrkbase.Re_Arrange_workers_According_assending_order_of_the_date(req.query.userid, req.query.wkid).then((www) => {


                          for (i = 0; i < no_day; i++) {
                            subadmindb.Work_alert_message_To_Worker(info[i].workers.workerid, info[i].wkid, info[i].workerinfo.stime, info[i].workerinfo.entim).then((resc) => {
                              wrkbase.Update_state_off_first_message_to_worker(obj.userid, obj._id).then((resc) => {
                                res.render("./workers/jobs-page", { wk: true, user: req.session.wrker, jobs, fill });
                              });
                            });
                          }
                        })
                      });
                    }
                  });
                }
                else {
                  if (resc) {
                    res.render("./workers/jobs-page", { wk: true, user: req.session.wrker, jobs, fill, already: "Your Already In", });
                  }
                  else {
                    res.render("./workers/jobs-page", { wk: true, user: req.session.wrker, jobs, fill, succ: "Request Successfully Commited" });
                  }
                }
              });
            });
          });
        })
      }
    })

  });
});
router.get("/notification", verifyworker, (req, res) => {
  wrkbase
    .If_worker_view_WrkMessage_change_object(req.session.wrker._id)
    .then(() => {
      wrkbase
        .view_Work_notification_Befor_work_starting_to_each_selected_workers(
          req.session.wrker._id
        )
        .then((info) => {
          res.render("./workers/work-notification", {
            wk: true,
            user: req.session.wrker,
            info,
          });
        });
    });
});
router.post("/testing", verifyworker, (req, res) => {

  wrkbase.Get_No_of_emplee_User_Want_For_compairing_with_noOf_worker_dayBy_Day(req.query.userid, req.query.wkid).then((number) => {
    //var date = req.body.date;
    //var datrarray=date.split(',');
    wrkbase.Check_whether_The_No_of_worker_already_full_in_a_referd_date_or_not(datrarray, number).then((state, isfull) => {
      if (isfull) {

      }
      else {

      }
    })
  })
});
router.get('/undertest', (req, res) => {
  wrkbase.Re_Arrange_workers_According_assending_order_of_the_date('65b27285468dd11f8c84fd81', '662d6c6fdc0c02309fe5da81').then((resc) => {
    console.log(resc);
  })
})

module.exports = router;
