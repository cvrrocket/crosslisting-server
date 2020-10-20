const Router = require("express").Router();
const fs = require("fs");
const util = require("util");
const imageToBase64 = require("image-to-base64");
const { ProductDoc, ClientDoc, RateDoc, TransactionDoc } = require("./schemas");

const readFile = util.promisify(fs.readFile);
Router.post("/", async (req, res, next) => {
  let names = req.body;
  let image = [];
  for (let i = 0; i < names.length; i++) {
    let data = await readFile(`./assets/${decodeURI(names[i])}`, "base64");
    image.push(data);
  }
  res.send(image);
  next();
});

Router.post("/crossimg", async (req, res, next) => {
  const url = req.body;
  console.log(url);
  base64array = [];
  for (let i = 0; i < url.length; i++) {
    await imageToBase64(url[i])
      .then((response) => {
        base64array.push(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  res.send(base64array);
});

Router.put("/url/:pid", (req, res, next) => {
  console.log("got from ext");
  const { pid } = req.params;

  if (req.body.domain != "app.hammoq.com") {
    _id = req.body.clientid;
  }
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
module.exports = Router;
