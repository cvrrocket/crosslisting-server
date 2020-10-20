const fs = require("fs");
module.exports = (name) => {
  if (fs.existsSync(`./assets/${name}`)) {
    fs.unlinkSync(`./assets/${name}`);
  }
};
