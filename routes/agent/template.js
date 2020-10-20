const Router = require("express").Router();
const crypto = require("crypto");
const multer = require("multer");
const { AgentTemplateDoc, TemplateDoc } = require("../../schemas");

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

Router.get("/cid/:client_id/:temp_id", (req, res, next) => {
  //get all details of particular client's particular template
  const { client_id, temp_id } = req.params;
  TemplateDoc.findOne(
    { userId: client_id, "templates._id": temp_id },
    { "templates.$": 1 }
  )
    .then((template) => {
      res.send(template);
    })
    .catch(next);
});

Router.get("/cid/:cid", (req, res, next) => {
  //get all client template
  const { cid } = req.params;
  TemplateDoc.findOne({ userId: cid })
    .then((template) => {
      res.send(template);
    })
    .catch(next);
});

Router.get("/:templateid", (req, res, next) => {
  const { agentid } = req.headers;
  const { templateid } = req.params;
  AgentTemplateDoc.findOne(
    { userId: agentid, "templates._id": templateid },
    { "templates.$": 1 }
  )
    .then((template) => {
      res.send(template);
    })
    .catch(next);
});

Router.get("/", (req, res, next) => {
  const { agentid } = req.headers;
  AgentTemplateDoc.findOne({ userId: agentid })
    .then((template) => {
      res.send(template);
    })
    .catch(next);
});

Router.post("/", (req, res, next) => {
  console.log(req.headers);
  const { agentid } = req.headers;
  AgentTemplateDoc.findOneAndUpdate(
    { userId: agentid },
    { $push: { templates: req.body } },
    { upsert: true, new: true }
  )
    .then((template) => {
      res.send(template);
    })
    .catch(next);
});

Router.put("/:templateid", uploadFile.fields(feilds), (req, res, next) => {
  req.body.images = {};
  const images = Object.keys(req.files);
  console.log(req.body);
  images.forEach((image) => {
    req.body.images[image] = req.files[image][0].filename;
  });
  keys.forEach((key) => {
    if (req.body[key]) req.body.images[key] = req.body[key];
  });
  req.body.ebay = { title: req.body.ebay, check: req.body.ebayc };
  req.body.mercari = { title: req.body.mercari, check: req.body.mercaric };
  req.body.poshmark = { title: req.body.poshmark, check: req.body.poshmarkc };
  req.body.delist = { title: req.body.delist, check: req.body.delistc };
  const { agentid } = req.headers;
  const { templateid } = req.params;
  AgentTemplateDoc.findOneAndUpdate(
    { userId: agentid, "templates._id": templateid },
    { "templates.$.data": req.body },
    { new: true }
  )
    .then(({ templates }) => {
      res.send(templates);
    })
    .catch(next);
});

Router.delete("/:templateid", (req, res, next) => {
  const { _id } = req.agent._doc;
  const { templateid } = req.params;
  AgentTemplateDoc.findOneAndUpdate(
    { userId: _id },
    { $pull: { templates: { _id: templateid } } },
    { new: true }
  )
    .then((templates) => res.send(templates))
    .catch(next);
});

module.exports = Router;
