const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const Verify = require("../model/verification");
let ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");

router.patch("/verification/:email/:password/:type", (req, res) => {
  const pass = req.params.password;
  const email = req.params.email;
  User.find({ email: email })
    .then((result2) => {
      if (result2.length !== 0) {
        User.find({ email: "murtuza5246@gmail.com" })
          .then((user) => {
            if (user.length < 1) {
              return res.status(200).json({
                message: "Auth failed",
              });
            }

            bcrypt.compare(pass, user[0].password, (err, result) => {
              if (err) {
                return res.status(200).json({
                  message: "Password or Email is wrong",
                });
              }

              if (result) {
                if (req.params.type === "activate") {
                  Verify.find({ filter: "myNewFilter" })
                    .then((result1) => {
                      const checkList = result1[0].users.filter(
                        (item) =>
                          toString(item.userId) === toString(result2[0]._id)
                      );

                      if (checkList.length === 0) {
                        Verify.update(
                          { filter: "myNewFilter" },
                          { $push: { users: { userId: result2[0]._id } } }
                        )
                          .then((result3) => {
                            res.status(200).json({
                              message: "updated successfully",
                            });
                          })
                          .catch((err) => {
                            res.status(200).json({
                              message: "not updated",
                              error: err,
                            });
                          });
                      } else {
                        res.status(200).json({
                          message: "user is already available",
                          error: err,
                        });
                      }
                    })
                    .catch((err) => {});
                } else if (req.params.type === "deactivate") {
                  Verify.find({ filter: "myNewFilter" })
                    .then((result1) => {
                      const checkList = result1[0].users.filter(
                        (item) =>
                          toString(item.userId) !== toString(result2[0]._id)
                      );

                      if (result1[0].users.length !== checkList.length) {
                        Verify.update(
                          { filter: "myNewFilter" },
                          { users: checkList }
                        )
                          .then((result3) => {
                            res.status(200).json({
                              message: "updated successfully",
                            });
                          })
                          .catch((err) => {
                            res.status(200).json({
                              message: "not updated",
                              error: err,
                            });
                          });
                      } else {
                        res.status(200).json({
                          message: "user is not available",
                          error: err,
                        });
                      }
                    })
                    .catch((err) => {});
                }
              }
            });
          })
          .catch((err) => {
            res.status(200).json({
              message: "Password failed",
              error: err,
            });
          });
      } else {
        res.status(200).json({
          message: "user does not found",
        });
      }
    })
    .catch();
});

////////////////////////////////////////////////////

router.get("/verification/users", (req, res) => {
  Verify.find({ filter: "myNewFilter" })
    .then((result) => {
      console.log(result[0].users);
      res.status(200).json({
        data: result[0].users,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
});

module.exports = router;
