const ClientDoc = require("./Client/Client");
const PasswordDoc = require("./Client/Passwords");
const ProductDoc = require("./Product").model;
const TransactionDoc = require("./Client/Transactions");
const TemplateDoc = require("./Client/Templates");
const AdminDoc = require("./Admin/Admin");
const AgentTemplateDoc = require("./Agent/AgentTemplate");
const AgentDoc = require("./Agent/Agent");
const RateDoc = require("./Rates");
const ConfigDoc = require("./config");

module.exports = {
  ClientDoc,
  PasswordDoc,
  ProductDoc,
  TransactionDoc,
  TemplateDoc,
  AdminDoc,
  AgentDoc,
  AgentTemplateDoc,
  RateDoc,
  ConfigDoc,
};
