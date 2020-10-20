const fs = require("fs");
const crypto = require("crypto");

const copyImage = (name) => {
  const newname = crypto.randomBytes(15).toString("hex") + name;
  fs.copyFile("./assets/" + name, "./assets/" + newname, (err) => {
    if (err) throw err;
  });
  return newname;
};

module.exports = { copyImage };
