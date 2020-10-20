const Router = require("express").Router();
const { ProductDoc } = require("../../../schemas");
const { deleteImage } = require("../../../utils");

Router.delete("/:productid", (req, res, next) => {
  const { _id } = req.client._doc;
  const { productid } = req.params;

  ProductDoc.findOne({ userId: _id })
    .then((user) => {
      const idx = user.products.findIndex(
        (product) => product._id.toString() === productid
      );

      // delete images
      const imageKeys = Object.keys(user.products[idx].images);
      imageKeys.forEach(
        (image) =>
          image !== "$init" && deleteImage(user.products[idx].images[image])
      );

      user.products.splice(idx, 1);
      return user.save();
    })
    .then((user) => res.send(user))
    .catch(next);
});

module.exports = Router;
