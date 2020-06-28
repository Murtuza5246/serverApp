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
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };
// const user = process.env.MONGO_PS;
// const password = process.env.MONGO_USER;
// const DB = process.env.MONGO_DB;
// const uri = `mongodb://${user}:${password}@cluster020-shard-00-00-ndanr.mongodb.net:27017,cluster020-shard-00-01-ndanr.mongodb.net:27017,cluster020-shard-00-02-ndanr.mongodb.net:27017/${DB}?ssl=true&replicaSet=cluster020-shard-0&authSource=admin&retryWrites=true`;

// const storage = new GridFsStorage({
//   url: uri,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(100, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = file.originalname;
//         const fileInfo = {
//           filename: filename,
//           bucketName: "ComposeFile",
//         };
//         resolve(fileInfo);
//       });
//     });
//   },
// });
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 500,
//   },
//   fileFilter: fileFilter,
// });

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
              url: "http://problemspotter.com/statements/" + doc._id,
            },
          };
        }),
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
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
  // checkAuth,
  upload.single("statementImage"),
  (req, res, next) => {
    const statement = new Statement({
      _id: new mongoose.Types.ObjectId(),
      identifier: req.body.identifier,
      title: req.body.title,
      statement: req.body.statement,
      place: req.body.place,
      field: req.body.field,
      email: req.body.email,
      profileImage: req.body.profileImage,
      // imageId: req.body.imageId,
      statementImage: req.file.filename,
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
////////////////////////////////////////////////////////////////////////////////////////
router.post(
  "/compose/textonly",
  checkAuth,
  upload.single("statementImage"),
  (req, res, next) => {
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
      // imageId: req.body.imageId,
      date: req.body.date,
      time: req.body.time,
      organization: req.body.organization,
      organizationLink: req.body.organizationLink,
      approved: req.body.approval,
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
