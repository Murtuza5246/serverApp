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
    let keywordData = JSON.parse(req.body.keyword);
    const statement = new Statement({
      _id: new mongoose.Types.ObjectId(),
      identifier: req.body.identifier,
      title: req.body.title,
      statement: req.body.statement,
      place: req.body.place,
      field: req.body.field,
      email: req.body.email,
      profileImage: req.body.profileImage,
      userId: req.body.userId,
      keywords: keywordData,
      statementImage: req.files,
      date: req.body.date,
      shareEmail: req.body.shareEmail,
      time: req.body.time,
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
    let keywordData = JSON.parse(req.body.keyword);

    const statement = new Statement({
      _id: new mongoose.Types.ObjectId(),
      identifier: req.body.identifier,
      title: req.body.title,
      statement: req.body.statement,
      place: req.body.place,
      field: req.body.field,
      email: req.body.email,
      statementImage: "",
      shareEmail: req.body.shareEmail,
      profileImage: req.body.profileImage,
      date: req.body.date,
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
