const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

const app = express();
const router = express.Router();
// Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));

const upload = require("./imageUploadEngine");
// Mongo URI
// const mongoURI = 'mongodb://localhost:27017/fileU';

// // Create mongo connection
// const conn = mongoose.createConnection(mongoURI);

const user = process.env.MONGO_PS;
const password = process.env.MONGO_USER;
const DB = process.env.MONGO_DB;
const mongoURI = `mongodb://${user}:${password}@cluster020-shard-00-00-ndanr.mongodb.net:27017,cluster020-shard-00-01-ndanr.mongodb.net:27017,cluster020-shard-00-02-ndanr.mongodb.net:27017/${DB}?ssl=true&replicaSet=cluster020-shard-0&authSource=admin&retryWrites=true`;
const conn = mongoose.createConnection(mongoURI);

// // Init gfs
let gfs;

conn.once("open", () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// // Create storage engine
// const storage = new GridFsStorage({
//   url: mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       const filename = file.originalname;
//       const fileInfo = {
//         filename: filename,
//         bucketName: "uploads",
//       };
//       resolve(fileInfo);
//     });
//   },
// });

// const upload = multer({ storage });

// router.post("/upload", upload.single("file"), (req, res) => {
//   console.log(req.file.filename);

//   res.status(200).json({
//     message: "successfully uploaded",
//   });
// });
///////////////////////////////////////

// router.get("/", (req, res) => {
//   gfs.files.find().toArray((err, files) => {
//     // Check if files
//     if (!files || files.length === 0) {
//       res.status(404).json({
//         message: "not found",
//       });
//     } else {
//       files.map((file) => {
//         if (
//           file.contentType === "image/jpeg" ||
//           file.contentType === "image/png"
//         ) {
//           file.isImage = true;
//         } else {
//           file.isImage = false;
//         }
//       });
//       res.status(200).json(files);
//       //   res.render("index", { files: files });
//     }
//   });
// });
//////////////////////////////////////////////////////////
// router.get("/files/:filename", (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     // Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: "No file exists",
//       });
//     }
//     // If File exists this will get executed
//     const readstream = gfs.createReadStream(file.filename);
//     return readstream.pipe(res);
//   });
// });

router.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if the input is a valid image or not
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }

    // If the file exists then check whether it is an image
    if (
      file.contentType === "image/jpeg" ||
      file.contentType === "image/png" ||
      file.contentType === "application/pdf" ||
      file.contentType === "application/msword"
    ) {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not an image",
      });
    }
  });
});

// delete function to remove the file from the database
// router.delete("/files/:id", (req, res) => {
//   gfs.remove({ _id: req.params.id, root: "uploads" }, (err, gridStore) => {
//     if (err) {
//       return res.status(404).json({ err: err });
//     }

//     res.status(404).json({
//       message: "not deleted",
//     });
//   });
// });

module.exports = router;
