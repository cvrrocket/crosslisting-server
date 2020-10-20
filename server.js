/* Clears the terminal */
process.stdout.write("\033c");

require("dotenv").config();
var fs = require("fs");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const crypto = require("crypto");
const base64ToImage = require("base64-to-image");

const { PORT, DB_CONNECTION_STRING } = process.env;

const siofu = require("socketio-file-upload");
mongoose
  .connect(DB_CONNECTION_STRING, {
    dbName: "hammock",
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((_) => console.log("Connection to MongoDB eshtablished!"))
  .catch((err) => console.log(err));

// let img = [];

// const gettedImage = (id) => {
//   console.log(img);
//   var objimg = [];
//   img.map((i) => {
//     if (i.cid == id) {
//       objimg.push(i);
//     }
//   });
//   return objimg;
// };
// module.exports = { gettedImage };

const app = express();

// var server = app.listen(8000);
// var io = require("socket.io").listen(server);
// //io.set("origins", "*:*");
// app.use(siofu.router);
app.use(cors());
app.use(logger("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/assets", express.static("assets"));
app.use(express.static(path.join(__dirname, "build")));

app.use("/api/client", require("./routes/client/client"));
app.use("/api/admin", require("./routes/admin/admin"));
app.use("/api/agent", require("./routes/agent/agent"));
app.use("/images", require("./images"));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

/* Error Handling */
app.use(
  (err, req, res, next) => console.log(err) || res.status(200).send({ err })
);

// DO NOT REMOVE: creates assets folder if not created.
if (!fs.existsSync("./assets")) {
  fs.mkdirSync("./assets");
}

const users = {};
const uploaddone = {};
const keys = [
  "default_image",
  "brand_image",
  "model_image",
  "side1_image",
  "side2_image",
  "front_image",
  "back_image",
  "condition1_image",
  "condition2_image",
  "condition3_image",
  "condition4_image",
  "condition5_image",
];

// io.on("connection", function (socket) {
//   //console.log("connection is successful" + " " + socket.id);
//   socket.on("cidinit", (c) => {
//     console.log(c.cid);
//     //filter using current user
//     img = img.filter((i) => {
//       return i.cid != c.cid;
//     });
//   });
//   // setTimeout(() => {
//   //   console.log(img);
//   // }, 10000);

//   socket.on("img", function (msg) {
//     //console.log(msg);
//     //uploaddone[msg.cid] = false;
//     const newname = crypto.randomBytes(15).toString("hex");
//     var base64Str = msg.base64;
//     var path = "./assets/";
//     var optionalObj = { fileName: newname, type: "png" };

//     base64ToImage(base64Str, path, optionalObj);

//     var imageInfo = base64ToImage(base64Str, path, optionalObj);
//     //console.log(imageInfo);
//     if (img.length == 0) {
//       img.push({
//         key: msg.key,
//         src: imageInfo.fileName,
//         cid: msg.cid,
//       });
//     } else {
//       var flag = 0;
//       img.map((i) => {
//         if (i.cid == msg.cid && i.key == msg.key) {
//           i.src = imageInfo.fileName;
//           flag = 1;
//         }
//       });
//       if (flag == 0) {
//         img.push({
//           key: msg.key,
//           src: imageInfo.fileName,
//           cid: msg.cid,
//         });
//       }
//     }

//     console.log(img);

//     users[msg.cid] = socket;
//     //uploaddone[msg.cid] = true;
//   });
//   socket.on("getimg", (msg) => {
//     //socket.emit("reimg", { img: img });
//     //io.to(users[msg.cid]).emit("reimg", { img: img }); if (users[msg.cid] = socket.id)
//     //users[msg.cid].emit("reimg", { img: img }); if (users[msg.cid] = socket)
//     var objimg = [];
//     img.map((i) => {
//       if (i.cid == msg.cid) {
//         objimg.push(i);
//       }
//     });
//     socket.emit("reimg", { img: objimg, id: msg.cid });
//     console.log(msg.cid + "::");
//     console.log(objimg);
//   });

//   socket.on("getuploadstatus", (msg) => {
//     console.log("imgcnt:" + img.length);
//     let imgcntt = 0;
//     img.map((i) => {
//       if (i.cid == msg.cid) {
//         imgcntt++;
//       }
//     });
//     socket.emit("imgupload", { imgcnt: imgcntt, cid: msg.cid });
//   });

//   try {
//     var uploader = new siofu();
//     uploader.dir = "./assets";
//     uploader.listen(socket);
//     uploader.on("saved", function (event) {
//       //console.log(event);
//       console.log(event.file.id + " : " + event.file.pathName.substring(7));

//       img.push({
//         key: keys[event.file.id],
//         src: event.file.pathName.substring(7),
//         cid: event.file.meta.cid,
//         index: event.file.id,
//         name: event.file.name,
//       });
//       socket.emit("server2clientimg", { img: img });
//     });
//   } catch (error) {
//     console.log(error);
//   }

//   socket.on("bimg", function (msg) {
//     //console.log(msg);
//     console.log("called bulk");

//     msg.bimg.map(async (bi) => {
//       const newname = crypto.randomBytes(15).toString("hex");
//       var base64Str = bi.base64;
//       var path = "./assets/";
//       var optionalObj = { fileName: newname, type: "png" };

//       var imageInfo = await base64ToImage(base64Str, path, optionalObj);
//       //console.log(imageInfo);

//       if (img.length == 0) {
//         img.push({ key: bi.key, src: imageInfo.fileName, cid: msg.cid });
//       } else {
//         var flag = 0;
//         img.map((i) => {
//           if (i.cid == msg.cid && i.key == bi.key) {
//             i.src = imageInfo.fileName;
//             flag = 1;
//           }
//         });
//         if (flag == 0) {
//           img.push({ key: bi.key, src: imageInfo.fileName, cid: msg.cid });
//         }
//       }
//     });
//     console.log(img);
//     users[msg.cid] = socket;
//   });
// });

app.listen(PORT || 8000, (err) =>
  console.log(err ? err : `Server running on port ${PORT || 8000}...`)
);
