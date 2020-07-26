const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Question = require("../model/question");
const User = require("../model/user");
const checkAuth = require("../middleWare/check-auth");
const app = express();

////////////////////////////////////
router.post("/new/ask", (req, res, next) => {
  const { name, email, questionAsked, time, date, userId } = req.body;

  User.find({ email: email })
    .then((result) => {
      if (result.length <= 0) {
        return res.status(409).json({
          message: "UserNot found",
        });
      } else {
        const question = new Question({
          _id: new mongoose.Types.ObjectId(),
          uploadedByName: name,
          uploadedByEmail: email,
          question: questionAsked,
          userId: result[0]._id,
          profileImage: result[0].profileImage,
          date: date,
          time: time,
          authType: result[0].authType,
          verified: result[0].verified,
        });
        question
          .save()
          .then((result) => {
            res.status(200).json({
              message: "Uploaded Successfully",
            });
          })
          .catch((err) => {
            console.log(err);

            res.status(400).json({
              message: "Went wrong",
            });

            error: err;
          });
      }
    })
    .catch((err) => {
      message: "Something Went Wrong";
      error: err;
    });
});
///////////////////////////////////////////////

router.get("/comments", (req, res, next) => {
  Question.find()
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Fetched",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Went wrong",
        error: err,
      });
    });
});

//////////////////////////////////////////////

router.get("/getcomments/:id", (req, res, next) => {
  const id = req.params.id;
  Question.findById(id)
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Fetched",
        comments: result.comments,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err,
      });
    });
});
////////////////////////////////////////////////

router.patch("/likes/:questionId/:userId", checkAuth, (req, res) => {
  const questionId = req.params.questionId;
  const userId = req.params.userId;

  Question.findOne({ _id: questionId })
    .exec()
    .then((result1) => {
      const likesArray = result1.likes;
      const mainLikesArray = result1.likes;

      const newArray = likesArray.filter((item) => item.userId !== userId);

      if (newArray.length === mainLikesArray.length) {
        Question.updateOne(
          { _id: questionId },
          { $set: { likes: [...mainLikesArray, req.body] } }
        )
          .exec()
          .then((result) => {
            return res.status(200).json({
              message: "Liked",
              data: result,
            });
          })
          .catch((err) => {
            return res.status(400).json({
              message: "something is wrong in updating field",
              error: err,
            });
          });
      } else {
        return res.status(200).json({
          message: "Hand is already raised",
        });
      }
    })

    .catch((err) => {
      res.status(400).json({
        message: "Last error catch",
        error: err,
      });
    });
});
////////////////////////////////////////////////

router.patch("/new/answer/:id", (req, res, next) => {
  const id = req.params.id;
  const newAnswer = req.body;
  Question.findById(id)
    .exec()
    .then((result) => {
      const preAnswers = result.comments;
      preAnswers.unshift(newAnswer);
      Question.update({ _id: id }, { $set: { comments: preAnswers } })
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
        message: "Internal error",
        error: err,
      });
    });
});

//////////////////////////////////////////////

module.exports = router;
