const Router = require("express").Router();
const { ProductDoc, ConfigDoc } = require("../../schemas");
const multer = require("multer");
const crypto = require("crypto");
const { deleteImage } = require("../../utils/deleteImage");
var namer = require("color-namer");

const vision = require("@google-cloud/vision");
// Creates a client(session)
const client = new vision.ImageAnnotatorClient({
  keyFilename: "gcpp1.json",
});

const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "./assets/");
  },
  filename: (req, file, cd) => {
    cd(null, crypto.randomBytes(10).toString("hex") + file.originalname);
  },
});

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

const uploadFile = multer({ storage });
const feilds = [
  { name: "default_image", maxCount: 1 },
  { name: "brand_image", maxCount: 1 },
  { name: "model_image", maxCount: 1 },
  { name: "side1_image", maxCount: 1 },
  { name: "side2_image", maxCount: 1 },
  { name: "front_image", maxCount: 1 },
  { name: "back_image", maxCount: 1 },
  { name: "condition1_image", maxCount: 1 },
  { name: "condition2_image", maxCount: 1 },
  { name: "condition3_image", maxCount: 1 },
  { name: "condition4_image", maxCount: 1 },
  { name: "condition5_image", maxCount: 1 },
];

Router.put(
  "/:clientid/:productid",
  uploadFile.fields(feilds),
  (req, res, next) => {
    req.body.images = {};

    const images = Object.keys(req.files);
    images.forEach((image) => {
      req.body.images[image] = req.files[image][0].filename;
    });
    keys.forEach((key) => {
      if (
        Object.keys(req.files).find((fileKey) => {
          return fileKey === key;
        }) === undefined
      )
        req.body.images[key] = req.body[key];
    });
    //console.log(req.body);
    if (
      req.body.ebayurl != "" &&
      req.body.ebayurl != null &&
      req.body.ebayurl != "d"
    ) {
      req.body.ebay = {
        title: req.body.ebay,
        check: req.body.ebayc,
        url: req.body.ebayurl,
      };
    } else {
      req.body.ebay = {
        title: req.body.ebay,
        check: req.body.ebayc,
      };
    }

    if (
      req.body.poshmarkurl != "" &&
      req.body.poshmarkurl != null &&
      req.body.poshmarkurl != "d"
    ) {
      req.body.poshmark = {
        title: req.body.poshmark,
        check: req.body.poshmarkc,
        url: req.body.poshmarkurl,
      };
    } else {
      req.body.poshmark = {
        title: req.body.poshmark,
        check: req.body.poshmarkc,
      };
    }

    if (
      req.body.mercariurl != "" &&
      req.body.mercariurl != null &&
      req.body.mercariurl != "d"
    ) {
      req.body.mercari = {
        title: req.body.mercari,
        check: req.body.mercaric,
        url: req.body.mercariurl,
      };
    } else {
      req.body.mercari = {
        title: req.body.mercari,
        check: req.body.mercaric,
      };
    }

    req.body.delist = { title: req.body.delist, check: req.body.delistc };
    const { productid, clientid } = req.params;
    ProductDoc.findOne({ userId: clientid })
      .then((user) => {
        const idx = user.products.findIndex(
          (product) => product._id.toString() === productid
        );

        // // Delete existing images;
        // const changedImages = Object.keys(req.body.images);
        // changedImages.forEach((image) => {
        //   deleteImage(user.products[idx].images[image]);
        // });

        // Update data
        const keys = Object.keys(req.body);
        keys.forEach((key) => {
          // If key is and object replace only the changes values
          if (typeof user.products[idx][key] === "object") {
            user.products[idx][key] = {
              ...user.products[idx][key],
              ...req.body[key],
            };
          } else {
            user.products[idx][key] = req.body[key];
          }
        });

        return user.save();
      })
      .then((user) => res.send(user.products))
      .catch(next);
  }
);

Router.get("/:userid", (req, res, next) => {
  const { userid } = req.params;
  ProductDoc.findOne({ userId: userid })
    .then((products) => res.send(products))
    .catch(next);
});

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

Router.get("/vision/:userid/:productid", (req, res, next) => {
  const { userid, productid } = req.params;
  ProductDoc.findOne(
    { userId: userid, "products._id": productid },
    { "products.$": 1 }
  )
    .then((product) => {
      fileName = product.products[0].images.default_image;
      filePath = "./assets/" + fileName;

      //logo detection
      client
        .logoDetection(filePath)
        .then((results) => {
          const logos = results[0].logoAnnotations;
          console.log(logos[0]);

          // console.log("logos:");
          // logos.forEach((logo) => console.log(logo));
          // console.log(results);

          ConfigDoc.find()
            .then((response) => {
              const configs = response[0].Configs;
              configs.map((config, idx) => {
                if (
                  logos[0].description.toLowerCase() ==
                  config.from.toLowerCase()
                ) {
                  logos[0].description = config.to;
                  console.log("3:" + logos[0]);
                }
              });
            })
            .catch(next);

          //color detection
          var maxcol = -100;
          var index = -1;
          client
            .imageProperties(filePath)
            .then((results) => {
              const colors =
                results[0].imagePropertiesAnnotation.dominantColors.colors;
              colors.forEach((color, i) => {
                maxcol = Math.max(maxcol, color.score);
                if (maxcol == color.score) {
                  //maximum score,or just take first one in array of obj
                  index = i;
                }
                // if (color.score * 100 > 60) {//threshold limit
                //   console.log(color);
                // }
              });

              //console.log(colors[index]);
              var hexcode = rgbToHex(
                colors[index].color.red,
                colors[index].color.green,
                colors[index].color.blue
              );
              //console.log(hexcode);
              var colorres = namer(hexcode);
              //console.log(colorres.basic[0].name);
              var total = {
                logo: logos[0],
                color: {
                  name: colorres.basic[0].name,
                  score: colors[index].score,
                },
              };
              res.send(total);
            })
            .catch((err) => {
              console.error("ERROR:", err);
            });
        })
        .catch((err) => {
          console.error("ERROR:", err);
        });
    })
    .catch(next);
});

Router.get("/:userid/:productid", (req, res, next) => {
  const { userid, productid } = req.params;
  ProductDoc.findOne(
    { userId: userid, "products._id": productid },
    { "products.$": 1 }
  )
    .then((product) => res.send(product))
    .catch(next);
});

Router.get("/cid/:sku/:cid", (req, res, next) => {
  const { sku, cid } = req.params;
  ProductDoc.find({})
    .then((data) => {
      var cidd = "1";
      var pid = "1";
      var index = 0;
      data.map((i) => {
        //all users products/all products
        i.products.map((j, ind) => {
          //particular users products
          if (j.sku == sku) {
            pid = j._id;
            cidd = i.userId;
            index = ind;
          }
        });
      });

      ProductDoc.findOne({ userId: cidd }).then((data) => {
        res.send(data.products[index]);
      });
    })
    .catch(next);
});

module.exports = Router;
