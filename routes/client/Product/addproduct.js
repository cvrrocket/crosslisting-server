const Router = require("express").Router();
const multer = require("multer");
const crypto = require("crypto");
const { gettedImage } = require("../../../server");
const { copyImage } = require("../../../utils/copyimage");
const {
  ProductDoc,
  ClientDoc,
  RateDoc,
  TransactionDoc,
} = require("../../../schemas");

const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, "./assets/");
  },
  filename: (req, file, cd) => {
    cd(null, crypto.randomBytes(10).toString("hex") + file.originalname);
  },
});

const uploadFile = multer({ storage });

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

Router.post("/", uploadFile.fields(feilds), async (req, res, next) => {
  const { _id } = req.client._doc;
  const img = gettedImage(_id);
  console.log(img);
  console.log(req.body);
  req.body.images = {};
  //add routine

  if (Object.keys(req.files).length == 0) {
    //req.files == undefined
    if (JSON.parse(req.body.imgFromSite).length != 0) {
      JSON.parse(req.body.imgFromSite).map((i) => {
        req.body.images[Object.keys(i)[0]] = i[Object.keys(i)[0]];
      });
    } else {
      const images = keys;
      images.forEach((image) => {
        if (!!req.body[image])
          req.body.images[image] = copyImage(req.body[image]);
      });
    }
  }

  if (Object.keys(req.files).length > 0) {
    // Object.keys(req.files).length > 0;
    // req.files == undefined;
    const images = Object.keys(req.files);
    images.forEach((image) => {
      req.body.images[image] = req.files[image][0].filename;
    });
  }

  var cnt = 0;

  if (req.body.ebayc == "true") {
    console.log(req.body.ebayc);
    cnt++;
    console.log(cnt);
  }
  if (req.body.poshmarkc == "true") {
    console.log(req.body.poshmarkc);
    cnt++;
    console.log(cnt);
  }
  if (req.body.mercaric == "true") {
    console.log(req.body.mercaric);
    cnt++;
    console.log(cnt);
  }
  JSON.parse(req.body.others).map((obj, i) => {
    if (obj.status == true) {
      cnt++;
    }
  });

  var rate1 = 0,
    rate2 = 0,
    rate3 = 0;
  var total = 0;
  rate1 = parseFloat(req.body.rate1);
  rate2 = parseFloat(req.body.rate2);
  if (req.body.delistc == "true") {
    rate3 = parseFloat(req.body.rate3);
  }

  total = rate1 + rate2 + rate3;
  console.log(total);

  req.body.ebay = { title: req.body.ebay, check: req.body.ebayc };
  req.body.mercari = { title: req.body.mercari, check: req.body.mercaric };
  req.body.poshmark = { title: req.body.poshmark, check: req.body.poshmarkc };
  req.body.delist = { title: req.body.delist, check: req.body.delistc };

  RateDoc.find()
    .then((rates) => {
      bprice = rates[0].Rates[rates[0].Rates.length - 1].basic;
      console.log(bprice);
      ClientDoc.findOne({ _id: _id }, { balance: 1 })
        .then((bal) => {
          let transaction = {
            userId: _id,
            amount: total,
            receipt_url: `Deducted ${total.toFixed(
              2
            )} from the available balance`,
            status: " ",
            receipt_no: " ",
            network_status: " ",
            seller_message: " ",
            source: " ",
            charge_id: " ",
            balance_transaction_id: " ",
            date: new Date(),
          };

          TransactionDoc.create(transaction)
            .then((result) => {
              console.log(result);
              res.json({
                success: true,
                msg: "Payment successful",
                receipt_url: transaction.receipt_url,
              });
            })
            .catch(next);

          ClientDoc.findByIdAndUpdate(_id, {
            $set: { balance: bal.balance - total },
          }).catch(next);
        })
        .catch(next);
    })
    .catch(next);

  var l = new Date();
  req.body.date = l;
  ProductDoc.findOneAndUpdate(
    { userId: _id },
    { $push: { products: req.body } },
    { new: true, upsert: true }
  )
    .then((products) => {
      ClientDoc.findOne({ _id: _id }, { noOfProducts: 1 })
        .then((count) => {
          console.log(count);
          ClientDoc.findByIdAndUpdate(
            { _id: _id },
            {
              $set: { noOfProducts: count.noOfProducts + 1 },
            }
          ).catch(next);
        })
        .catch(next);
      res.send(products);
    })
    .catch(next);
});

Router.post("/:productid", (req, res, next) => {
  const { _id } = req.client._doc;
  const { productid } = req.params;
  let idx = "";
  ProductDoc.findOne({ userId: _id })
    .then((user) => {
      ClientDoc.findOne({ _id: _id }, { noOfProducts: 1 })
        .then((count) => {
          console.log(count);
          ClientDoc.findByIdAndUpdate(
            { _id: _id },
            {
              $set: { noOfProducts: count.noOfProducts + 1 },
            }
          ).catch(next);
        })
        .catch(next);
      idx = user.products.findIndex(
        (product) => product._id.toString() === productid
      );
      const prod = {};
      Object.keys(user.products[idx]["_doc"]).forEach((key) => {
        if (key !== "_id") prod[key] = user.products[idx]["_doc"][key];
      });
      const imageKeys = Object.keys(prod.images);
      imageKeys.forEach((image) => {
        if (prod.images[image] != null)
          prod.images[image] = copyImage(prod.images[image]);
      });
      ProductDoc.findOneAndUpdate(
        { userId: _id },
        { $push: { products: prod } },
        { new: true, upsert: true }
      )
        .then((products) => res.send(products))
        .catch(next);
    })
    .catch(next);
});

module.exports = Router;
