const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const checkAuth = require("../middleWare/check-auth.js");
const Statement = require("../model/statements");
const fileUpload = require("express-fileupload");
const Upload = require("../model/upload");
const app = express();
const upload = require("./imageUploadEngine");
const Question = require("../model/question.js");
const { json } = require("body-parser");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "problemspotter35@gmail.com",
    pass: "Problemspotter@5246",
  },
});
////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////

router.get("/", checkAuth, (req, res, next) => {
  Statement.find()
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        statements: docs.map((doc) => {
          return {
            identifier: doc.identifier,
            statement: doc.statement,
            statementImage: doc.statementImage,

            _id: doc._id,
            request: {
              type: "GET",
            },
          };
        }),
      };

      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
// //////////////////
router.post(
  "/compose",
  checkAuth,
  upload.array("statementImage", 10),
  (req, res, next) => {
    console.log(req.body);
    let keywordData = JSON.parse(req.body.keyword);
    const statement = new Statement({
      _id: new mongoose.Types.ObjectId(),
      identifier: req.body.identifier,
      title: req.body.title,
      statement: req.body.statement,
      place: req.body.place,
      youTubeURL: req.body.youTubeURL,
      field: req.body.field,
      email: req.body.email,
      profileImage: req.body.profileImage,
      userId: req.body.userId,
      keywords: keywordData,
      attention: false,
      mSecond: new Date().getTime(),
      statementImage: req.files,
      date: req.body.date,
      shareEmail: req.body.shareEmail,
      time: req.body.time,
      youTubeURLDescription: req.body.youTubeURLDescription,
      organization: req.body.organization,
      organizationLink: req.body.organizationLink,
      approved: false,
      link: req.body.link,
      linkTitle: req.body.linkTitle,
    });
    // res.status(201).send();
    statement
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Created statement successfully",
          createdStatment: {
            identifier: result.identifier,
            statement: result.statement,
            _id: result._id,
            request: {
              type: "GET",
            },
          },
        });
        transporter.sendMail(
          {
            from: "problemspotter35@gmail.com",
            to: req.body.email,
            subject: "Sending Email using Node.js",
            html: `<h1>Hi ${req.body.identifier},</h1><br/><p>your statement is successfully submitted on problemspotter.com for review, once it is done we will let you know about this</p><img src='https://my-server-problemspotter.herokuapp.com/websiteLogo/newlogo.jpg'  /><h4>The contributor like you is holding the civil engineering society in this technology era<h4/>`,
          },
          function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          }
        );
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
);
////////////////////////////////////////////////////////////////////////////////////////
router.post(
  "/compose/textonly",
  checkAuth,
  upload.single("statementImage"),
  (req, res, next) => {
    console.log(req.body);
    let keywordData = JSON.parse(req.body.keyword);

    const statement = new Statement({
      _id: new mongoose.Types.ObjectId(),
      identifier: req.body.identifier,
      title: req.body.title,
      statement: req.body.statement,
      place: req.body.place,
      field: req.body.field,
      attention: false,
      mSecond: new Date().getTime(),
      email: req.body.email,
      statementImage: "",
      shareEmail: req.body.shareEmail,
      profileImage: req.body.profileImage,
      date: req.body.date,
      youTubeURL: req.body.youTubeURL,
      youTubeURLDescription: req.body.youTubeURLDescription,
      time: req.body.time,
      userId: req.body.userId,
      organization: req.body.organization,
      organizationLink: req.body.organizationLink,
      approved: req.body.approval,
      keywords: keywordData,
      link: req.body.link,
    });
    statement
      .save()
      .then((result) => {
        res.status(201).json({
          message: "Created statement successfully",
          createdStatment: {
            identifier: result.identifier,
            statement: result.statement,
            _id: result._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + result._id,
            },
          },
        });
        transporter.sendMail(
          {
            from: "problemspotter35@gmail.com",
            to: req.body.email,
            subject: "Sending Email using Node.js",
            // text: `Hi ${req.body.identifier}, thank you for your contribution on problemspotter.com.
            //       You will get to know once your statement get an action by admin`,
            html: `<h1>Hi ${req.body.identifier},</h1><br/><p>your statement is successfully submitted on problemspotter.com for review, once it is done we will let you know about this</p><img src='https://my-server-problemspotter.herokuapp.com/websiteLogo/newlogo.jpg'  /><h4>The contributor like you is holding the civil engineering society in this technology era<h4/>`,
          },
          function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          }
        );
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
);
//////////////////////////////////

router.get("/admin/approved/:email", (req, res) => {
  const email = req.params.email;
  Statement.find({ actionAdminEmail: email, approved: true })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
      console.log(err);
    });
});
router.patch("/updateFields/:id", checkAuth, (req, res) => {
  const id = req.params.id;
  const { updatedTitle, updatedContent } = req.body;
  Statement.update(
    { _id: id },
    { $set: { title: updatedTitle, statement: updatedContent } }
  )
    .then((result) => {
      res.status(200).json({
        message: "Success",
        updatedContent,
        updatedTitle,
        id,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
///////////////////////////////////

///////////////////////////////////

router.get("/pending", (req, res, next) => {
  Statement.find({ approved: false })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      error: err;
    });
});

//////////////////////////////////////////////////////////////////////////

router.get("/my/:id", (req, res) => {
  const id = req.params.id;

  Statement.find({ userId: id })
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      return res.status(200).json({
        message: "Something went wrong",
        error: MediaStreamError,
      });
    });
});
//////////////////////////////////////////////////////////////////////////

router.get("/userStatements/approved", (req, res, next) => {
  Statement.find({ approved: true })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
});
router.get("/user/statements/:statementId", (req, res, next) => {
  const id = req.params.statementId;
  Statement.findById(id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// //////////////////////////////////////////////////////////////////////

router.patch("/pending/approval/:pendingId", checkAuth, (req, res, next) => {
  const id = req.params.pendingId;
  Statement.updateOne(
    { _id: id },
    {
      $set: {
        approved: true,
        actionAdminEmail: req.body.emailOfApprover,
        actionAdminName: req.body.nameOfApprover,
        actionAdminDate: req.body.dateOfApprover,
        actionAdminTime: req.body.timeOfApprover,
      },
    }
  )
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "SuccessFully approved",
      });
      console.log(result);
      transporter.sendMail(
        {
          from: "problemspotter35@gmail.com",
          to: req.body.email,
          subject: "Sending Email using Node.js",
          // text: `Hi ${req.body.name}, the statement which you have uploaded on problemspotter is approved.
          //       The supporters like you is holding the civil field in technology era`,
          html: `<h1>Hi ${req.body.name}</h1><h3>The statement <strong>"${req.body.statementDetails.title}"</strong></h3><h4>is <strong style="color:green;text-align:center" >approved with high attention✅</strong></h4><br/><h4>your statement is marked as a high attention statement it means your statement will get a golden boarder on problemspotter.com </h4><img src='https://my-server-problemspotter.herokuapp.com/websiteLogo/newlogo.jpg' /><br/><h3>Your above statement is approved and now live on <a href='problemspotter.com//user/statement/id/${req.body.statementDetails._id}'>Click here</a></h3><br/><p>The contributor like you is holding the civil society in technology era hope that the statement written by you will be very helpful for the students who wants to earn something in their life😊</p><br/><p>Love from problemspotter.com ❤</p>`,
        },
        function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong , Please try again later",
      });
    });
});
///////////////////////////////////////////////////////////

router.patch("/pending/attention/:pendingId", checkAuth, (req, res, next) => {
  const id = req.params.pendingId;
  Statement.updateOne(
    { _id: id },
    {
      $set: {
        approved: true,
        attention: true,
        actionAdminEmail: req.body.emailOfApprover,
        actionAdminName: req.body.nameOfApprover,
        actionAdminDate: req.body.dateOfApprover,
        actionAdminTime: req.body.timeOfApprover,
      },
    }
  )
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "SuccessFully approved & Madded as attention needed",
      });
      transporter.sendMail(
        {
          from: "problemspotter35@gmail.com",
          to: req.body.email,
          subject: "Sending Email using Node.js",
          // text: `Hi ${req.body.name}, the statement which you have uploaded on problemspotter is approved.
          //       The supporters like you is holding the civil field in technology era`,
          html: `<h1>Hi ${req.body.name}</h1><h3>The statement <strong>"${req.body.statementDetails.title}"</strong></h3><h4>is <strong style="color:green;text-align:center" >approved with high attention✅</strong></h4><br/><h4>your statement is marked as a high attention statement it means your statement will get a golden boarder on problemspotter.com </h4><img src='https://my-server-problemspotter.herokuapp.com/websiteLogo/newlogo.jpg' /><br/><h3>Your above statement is approved and now live on <a href='problemspotter.com//user/statement/id/${req.body.statementDetails._id}'>Click here</a></h3><br/><p>The contributor like you is holding the civil society in technology era hope that the statement written by you will be very helpful for the students who wants to earn something in their life😊</p><br/><p>Love from problemspotter.com ❤</p>`,
        },
        function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong , Please try again later",
      });
    });
});
///////////////////////////////////////////////////////////

router.post("/getSearchedFields", (req, res, next) => {
  Statement.find({ field: { $in: req.body } })
    .exec()
    .then((result) => {
      newResult = result.filter((approved) => Object.keys(approved) !== true);
      res.status(200).json(newResult);
    })
    .catch((err) => {
      res.status(500).json({
        message: "Not Worked",
        error: err,
      });
    });
});

////////////////////////////////////////////////////////////////////////////////
router.patch("/pending/rejection/:pendingId", (req, res, next) => {
  const id = req.params.pendingId;
  Statement.updateOne(
    { _id: id },
    {
      $set: {
        approved: null,
        actionAdminEmail: req.body.emailOfApprover,
        actionAdminName: req.body.nameOfApprover,
      },
    }
  )
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "SuccessFully rejected",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong , Please try again later",
      });
    });
});

//////////////////////////////////////////////////////////////////

router.get("/getcomments/:id", (req, res) => {
  const id = req.params.id;
  Statement.findById(id)
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Fetched",
        comments: result.comments,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// //////////////////////////////////////////////////////////////////////

router.patch("/new/answer/:id", (req, res) => {
  const id = req.params.id;
  const newQuestion = req.body; //object
  Statement.findById(id)
    .exec()
    .then((result) => {
      const comments = result.comments;
      comments.unshift(newQuestion);
      Statement.update({ _id: id }, { $set: { comments: comments } })
        .exec()
        .then((result) => {
          res.status(200).json({
            message: "Successfully updated",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Went Wrong",
            error: err,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Went wrong in main catch file",
      });
    });
});

////////////////////////////////////////////////////////////
module.exports = router;
//////////////////////////////////////////////////////////////////
