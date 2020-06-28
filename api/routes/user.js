const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = require("./imageUploadEngine");

const User = require("../model/user");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/profile");
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
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
//   fileFilter: fileFilter,
// });

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
              nState: req.body.nState,
              pCode: req.body.pCode,
              pString: req.body.pString,
              experience: req.body.experience,
              creationDate: req.body.creationDate,
              creationTime: req.body.creationTime,
              savedStatements: [],
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
  const arrayData = req.body;
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

router.patch(
  "/profile/:userId",
  upload.single("profileImage"),
  (req, res, next) => {
    const id = req.params.userId;
    User.updateOne(
      { _id: id },
      { $set: { profileImage: req.file.filename } },
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
