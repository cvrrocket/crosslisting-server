const Router = require("express").Router();
const multer = require("multer");
const crypto = require("crypto");
const {
  ProductDoc,
  ClientDoc,
  RateDoc,
  TransactionDoc,
} = require("../../../schemas");
const { deleteImage } = require("../../../utils");

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

Router.put("/:productid", uploadFile.fields(feilds), (req, res, next) => {
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
  req.body.ebay = {
    title: req.body.ebay,
    check: req.body.ebayc,
  };
  req.body.mercari = {
    title: req.body.mercari,
    check: req.body.mercaric,
  };
  req.body.poshmark = {
    title: req.body.poshmark,
    check: req.body.poshmarkc,
  };
  req.body.delist = {
    title: req.body.delist,
    check: req.body.delistc,
  };
  //var l=new Date();
  //req.body.date=l;
  const { _id } = req.client._doc;
  const { productid } = req.params;
  ProductDoc.findOne({ userId: _id })
    .then((user) => {
      const idx = user.products.findIndex(
        (product) => product._id.toString() === productid
      );

      // // Delete existing images;
      // const changedImages = Object.keys(req.body.images);
      // changedImages.forEach((image) => {
      //   deleteImage(user.products[idx].images[image]);
      // });
      //user.products[idx]['date']=l;
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
});

Router.put("/url/:pid", (req, res, next) => {
  console.log("got from ext");
  const { pid } = req.params;
  const { _id } = req.client._doc;

  // if (req.body.domain != "app.hammoq.com") {
  //   _id = req.body.clientid;
  // }
  ProductDoc.findOne({ userId: _id })
    .then((user) => {
      const idx = user.products.findIndex(
        (product) => product._id.toString() === pid
      );
      if (req.body.type == "delist") {
        if (req.body.name == "poshmark") {
          user.products[idx].poshmark.url = "d";
        } else if (req.body.name == "mercari") {
          user.products[idx].mercari.url = "d";
        } else if (req.body.name == "ebay") {
          user.products[idx].ebay.url = "d";
        } else {
          const y = [];
          JSON.parse(user.products[idx].others).map((obj, i) => {
            if (obj.name == req.body.name) {
              let otherobj = {
                name: obj.name,
                status: obj.status,
                url: "d",
              };
              y.push(otherobj);
            } else {
              let otherobj = {
                name: obj.name,
                status: obj.status,
                url: obj.url,
              };
              y.push(otherobj);
            }
          });

          user.products[idx].others = JSON.stringify(y);
        }
      } else {
        //listed or not listed & then updating in client info
        ProductDoc.findOne({ userId: _id })
          .then(async (user) => {
            const idx = user.products.findIndex(
              (product) => product._id.toString() === pid
            );
            if (user.products[idx].listed == false) {
              user.products[idx].listed = true;
              ClientDoc.findOne({ _id: _id }, { noOfProducts: 1 })
                .then(async (count) => {
                  //console.log(count);
                  await ClientDoc.findByIdAndUpdate(_id, {
                    $set: { noOfProducts: count.noOfProducts - 1 }, //noOfListings: count.noOfListings+1
                  }).catch(next);

                  await ProductDoc.findOne({ userId: _id })
                    .then((user) => {
                      var listed = 0;
                      var notlisted = 0;
                      user.products.map((p, i) => {
                        if (p.listed == true) {
                          listed += 1;
                        } else {
                          notlisted += 1;
                        }
                      });
                      console.log(listed + " : " + notlisted);
                      ClientDoc.findOne({ _id: _id })
                        .then((count) => {
                          ClientDoc.findByIdAndUpdate(_id, {
                            $set: {
                              noOfProducts: notlisted,
                              noOfListings: listed,
                            },
                          }).catch(next);
                        })
                        .catch(next);
                    })
                    .then()
                    .catch(next);
                })
                .catch(next);
              user.products[idx].listed = true; //req.body.status;
              return user.save();
            }
          })
          .then //(user) => res.send(user)
          ()
          .catch(next);

        if (req.body.name == "poshmark") {
          user.products[idx].poshmark.url = req.body.url;
          if (req.body.url != "") {
          }
        } else if (req.body.name == "mercari") {
          user.products[idx].mercari.url = req.body.url;
          if (req.body.url != "") {
          }
        } else if (req.body.name == "ebay") {
          user.products[idx].ebay.url = req.body.url;
          if (req.body.url != "") {
          }
        } else {
          const y = [];
          JSON.parse(user.products[idx].others).map((obj, i) => {
            if (obj.name == req.body.name) {
              let otherobj = {
                name: obj.name,
                status: obj.status,
                url: req.body.url,
              };
              y.push(otherobj);
            } else {
              let otherobj = {
                name: obj.name,
                status: obj.status,
                url: obj.url,
              };
              y.push(otherobj);
            }
          });

          user.products[idx].others = JSON.stringify(y);
        }
      }
      return user.save();
    })
    .catch(next);
});

Router.put("/status/:productid", (req, res, next) => {
  const { _id } = req.client._doc;
  const { productid } = req.params;

  ProductDoc.findOne({ userId: _id })
    .then((user) => {
      ClientDoc.findOne({ _id: _id }, { noOfProducts: 1 })
        .then((count) => {
          console.log(count);
          ClientDoc.findByIdAndUpdate(_id, {
            $set: { noOfProducts: count.noOfProducts - 1 },
          }).catch(next);
        })
        .catch(next);
      const idx = user.products.findIndex(
        (product) => product._id.toString() === productid
      );
      user.products[idx].status = req.body.status;
      console.log(user.products);
      return user.save();
    })
    .then((user) => res.send(user))
    .catch(next);
});

module.exports = Router;
