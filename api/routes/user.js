const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = require("./imageUploadEngine");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const User = require("../model/user");
const Statement = require("../model/statements");
const Question = require("../model/question");

const user = process.env.MONGO_PS;
const password = process.env.MONGO_USER;
const DB = process.env.MONGO_DB;
const mongoURI = `mongodb://${user}:${password}@cluster020-shard-00-00-ndanr.mongodb.net:27017,cluster020-shard-00-01-ndanr.mongodb.net:27017,cluster020-shard-00-02-ndanr.mongodb.net:27017/${DB}?ssl=true&replicaSet=cluster020-shard-0&authSource=admin&retryWrites=true`;
const conn = mongoose.createConnection(mongoURI);
const checkAuth = require("../middleWare/check-auth");

// Init gfs
let gfs;

conn.once("open", () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

//////////////////////////////////////////////
router.post("/signup", upload.single("profileImage"), (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(200).json({
          message: "User already exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              profileImage: req.file.filename,
              profileImageId: req.file.id,
              authType: req.body.authType,
              email: req.body.email,
              password: hash,
              fName: req.body.fName,
              lName: req.body.lName,
              contact: req.body.contact,
              dob: req.body.dob,
              cName: req.body.cName,
              cAddress: req.body.cAddress,
              city: req.body.city,
              about: req.body.about,
              nState: req.body.nState,
              pCode: req.body.pCode,
              pString: req.body.pString,
              experience: req.body.experience,
              creationDate: req.body.creationDate,
              creationTime: req.body.creationTime,
              savedStatements: [],
              verified: false,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "User Created successfully",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

////////////////////////////////

router.patch("/update/about/:id/:about", checkAuth, (req, res) => {
  const id = req.params.id;
  console.log(req.body);

  User.updateOne({ _id: id }, { $set: { about: req.params.about } })
    .then((result) => {
      res.status(200).json({
        message: "Successfully updated.",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

////////////////////////////////////////////////////////

router.delete("/delete/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User Removed Successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
///////////////////////////////////////
router.get("/statement/getArrayOfUser/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .then((result) => {
      if (result.savedStatements) {
        res.status(200).json({
          save: result.savedStatements,
        });
      }
      res.status(309).json({
        message: "not available",
        save: result.savedStatements,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
/////////////////////////////////////

router.get("/statement/profileFetcher/:userEmail", (req, res, next) => {
  const email = req.params.userEmail;
  User.findOne({ email: email })
    .exec()
    .then((result) => {
      res.status(200).json({
        image: result.profileImage,
      });
    })
    .catch((err) => {
      res.status(409).json({
        error: err,
      });
    });
});

//////////////////////////////////////
router.patch("/statement/save/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.update({ _id: id }, { $set: { savedStatements: req.body } })
    .then((result) => {
      res.status(200).json({
        message: "Saved SuccessFully",
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
});
////////////////////////////////////

router.get("/details/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "success",
        userDetails: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
//////////////////////////////////////////////

router.post("/upload/sound", upload.single("sound"), (req, res) => {
  console.log(req.file.filename);
  if (req.file.filename) {
    res.status(200).json({
      message: "uploaded",
      name: req.file,
    });
  } else {
    res.status(500).json({
      message: "Not uploaded",
      name: req.file,
    });
  }
});

//////////////////////////////////////////////////////////
router.patch(
  "/profile/:userId",
  upload.single("profileImage"),
  (req, res, next) => {
    const id = req.params.userId;

    User.findOne({ _id: id })
      .exec()
      .then((result1) => {
        console.log(result1);

        gfs.remove({ _id: result1.profileImageId, root: "uploads" });
      })
      .catch();

    User.updateOne(
      { _id: id },
      {
        $set: { profileImage: req.file.filename, profileImageId: req.file.id },
      },
      { upsert: true }
    )
      .exec()
      .then((result) => {
        res.status(200).json({
          message: "Photo updated",
        });
      })

      .catch((err) => {
        res.status(500).json({
          message: "Not Uploaded",
          error: err,
        });
      });
    Statement.updateMany(
      {},
      { $set: { "comments.$[i].profileImage": req.file.filename } },
      { arrayFilters: [{ "i.userId": id }] }
    )
      .then((result) => {})
      .catch((err) => {});
    Question.updateMany(
      { userId: id },
      { $set: { profileImage: req.file.filename } }
    )
      .then((result) => {
        // res.status(200).json({
        //   message: "may be updated",
        //   data: result,
        //   file: req.file.filename,
        // });
      })
      .catch((err) => {
        // res.status(400).json({
        //   error: err,
        //   message: "not updated",
        // });
      });
    Statement.updateMany(
      { userId: id },
      { $set: { profileImage: req.file.filename } }
    )
      .then((result) => {})
      .catch((err) => {});
    Question.updateMany(
      {},
      { $set: { "comments.$[i].profileImage": req.file.filename } },
      { arrayFilters: [{ "i.userId": id }] }
    )
      .then((result) => {
        // res.status(200).json({
        //   message: "may be updated",
        //   data: result,
        //   file: req.file.filename,
        // });
      })
      .catch((err) => {
        // res.status(400).json({
        //   error: err,
        //   message: "not updated",
        // });
      });
  }
);

////////////////////////////////////

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .then((user) => {
      if (user.length < 1) {
        return res.status(200).json({
          message: "Auth failed",
        });
      }

      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(200).json({
            message: "Password or Email is wrong",
          });
        }

        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
              authType: user[0].authType,
              fName: user[0].fName,
              lName: user[0].lName,
              verified: user[0].verified,
            },
            process.env.JWT_TOKEN,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            message: "Auth Successful",
            token: token,
            authType: user[0].authType,
            email: user[0].email,
            userId: user[0]._id,
            fName: user[0].fName,
            lName: user[0].lName,
          });
        }
        res.status(200).json({
          message: "Auth failed , check your password and email",
        });
      });
    })
    .catch((err) => {
      res.status(404).json({
        message: "Auth Failed",
        error: err,
      });
    });
});
/////////////////////////////////////////////////////

router.patch("/verification/:id/:type", (req, res) => {
  const id = req.params.userId;
  const type = req.params.type;
  console.log(type);
  const bool = req.body.bool;
  console.log(bool);

  User.updateOne({ _id: id }, { $set: { verified: false } })
    .exec()
    .then((result) => {
      // res.status(200).json({
      //   message: "May be successfully updated",
      //   result,
      // });
    })
    .catch();

  // User.updateOne(
  //   { _id: id },
  //   {
  //     $set: { verified: type },
  //   },
  //   { upsert: true }
  // )
  //   .exec()
  //   .then((result) => {
  //     res.status(200).json({
  //       message: "Photo updated",
  //     });
  //   })

  // .catch((err) => {
  //   res.status(500).json({
  //     message: "Not Uploaded",
  //     error: err,
  //   });
  // });
  Statement.updateMany(
    {},
    { $set: { "comments.$[i].verified": bool } },
    { arrayFilters: [{ "i.userId": id }] }
  )
    .then((result) => {
      // res.status(200).json({
      //   message: "statements comment section",
      //   result,
      // });
    })
    .catch((err) => {});
  Question.updateMany({ userId: id }, { $set: { verified: bool.toString() } })
    .then((result) => {
      res.status(200).json({
        message: "question comment section",
        result,
      });
    })
    .catch((err) => {
      // res.status(400).json({
      //   error: err,
      //   message: "not updated",
      // });
    });
  Statement.updateMany({ userId: id }, { $set: { verified: bool } })
    .then((result) => {})
    .catch((err) => {});
  Question.updateMany(
    {},
    { $set: { "comments.$[i].verified": bool.toString() } },
    { arrayFilters: [{ "i.userId": id }] }
  )
    .then((result) => {
      // res.status(200).json({
      //   message: "question comment section",
      //   result,
      // });
    })
    .catch((err) => {
      // res.status(400).json({
      //   error: err,
      //   message: "not updated",
      // });
    });
});

////////////////////////////////////////////////

router.get("/adminProfileGetter", (req, res, next) => {
  User.find({ authType: "Admin" })
    .select("profileImage fName lName")
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      error: err;
    });
});
/////////////////////////////////////////////

router.get("/identifier/details/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  User.findById(id)
    .then((result) => {
      Statement.find({ userId: id })
        .then((result1) => {
          res.status(200).json({
            userDetails: result,
            StatementUploaded: result1,
          });
        })
        .catch();
    })
    .catch((err) => {
      res.status(404).json({
        error: err,
      });
    });
});

///////////////////////////////////////////////////////
router.get("/savedStatemnets/:userId", (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .exec()
    .then((result) => {
      res.status(200).json({
        savedStatements: result.savedStatements,
      });
    })
    .catch();
});

module.exports = router;
