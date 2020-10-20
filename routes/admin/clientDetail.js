const Router = require("express").Router();
const { TransactionDoc, RateDoc, ProductDoc } = require("../../schemas");

//charts

Router.get("/trans/charts/:id", async (req, res, next) => {
  try {
    //const { _id } = req.client._doc;
    const { id } = req.params;
    const fetchtrans = await TransactionDoc.find({ userId: id });
    //console.log(fetchtrans);
    ratecard = [];
    trans = {
      initial: 0,
      basic: 0,
      advance: 0,
      list: 0,
      receipted: 0,
      initialamt: 0,
      basicamt: 0,
      advanceamt: 0,
      listamt: 0,
      receiptedamt: 0,
    };
    //console.log(fetchtrans)
    RateDoc.find()
      .then((rates) => {
        ratecard.push(rates[0].Rates[rates[0].Rates.length - 1]);
        fetchtrans.map((ft, i) => {
          if (ft.amount == 100) {
            trans["initial"] += 1;
          }
          if (
            ft.amount == ratecard[0].basic / 100 &&
            ft.receipt_url[0] != "h"
          ) {
            trans["basic"] += 1;
          }
          if (
            ft.amount == ratecard[0].advance / 100 &&
            ft.receipt_url[0] != "h"
          ) {
            trans["advance"] += 1;
          }
          if (ft.amount == ratecard[0].list / 100 && ft.receipt_url[0] != "h") {
            trans["list"] += 1;
          }
          if (ft.amount == 1 && ft.receipt_url[0] == "h") {
            trans["receipted"] += 1;
          }
        });
        trans["initialamt"] = trans["initial"] * 100;
        trans["basicamt"] = (trans["basic"] * ratecard[0].basic) / 100;
        trans["advanceamt"] = (trans["advance"] * ratecard[0].advance) / 100;
        trans["listamt"] = (trans["list"] * ratecard[0].list) / 100;
        trans["receiptedamt"] = trans["receipted"];
        console.log(trans);
        res.send(trans);
      })
      .catch(next);
  } catch (err) {
    res.json({ message: err });
  }
});

Router.get("/trans/monthly/charts/:id", async (req, res, next) => {
  try {
    //const { _id } = req.client._doc;
    const { id } = req.params;
    const fetchtrans = await TransactionDoc.find({ userId: id });
    //console.log(fetchtrans);
    var months = {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
    };
    fetchtrans.map((ft, i) => {
      let date = ft.date.getMonth();
      let amt = ft.amount;
      months[date] += amt;
    });
    res.send(months);
  } catch (err) {
    res.json({ message: err });
  }
});

Router.get("/prod/charts/:id", async (req, res, next) => {
  try {
    //const { _id } = req.client._doc;
    const { id } = req.params;
    const productData = await ProductDoc.find({ userId: id });
    profits = [];
    avg = 0;
    productData[0].products.map((p, i) => {
      let profit = p.price - p.shippingFees; //Profit = Product sold - shipping fee - ebay - additional fee - paypal fee
      profits.push({ profit: profit, id: p._id });
      avg += profit;
    });
    avg /= productData[0].products.length;
    res.send({ profits: profits, avg: avg });
  } catch (err) {
    res.json({ message: err });
  }
});

Router.get("/prod/selltime/charts/:id", async (req, res, next) => {
  try {
    //const { _id } = req.client._doc;
    const { id } = req.params;
    const productData = await ProductDoc.find({ userId: id });
    dates = [];
    productData[0].products.map((p) => {
      let datecreated = p.date.getMonth();
      let solddate = 9;
      dates.push({ created: datecreated, sold: solddate, id: p._id });
    });
    res.send(dates);
  } catch (err) {
    res.json({ message: err });
  }
});

//number of products created in particular date & % profit,product

Router.post("/prod/time/charts/", async (req, res, next) => {
  try {
    //const { _id } = req.client._doc;
    const { date, id } = req.body;
    const productData = await ProductDoc.find({ userId: id });
    var selectedDate = Number(date.toString().split("-")[2]);
    var selectedMonth = Number(date.toString().split("-")[1]);
    var selectedYear = Number(date.toString().split("-")[0]);
    var cnt = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0 };
    var amt = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0 };
    var totalMoney = 0;

    var noOfProducts = productData[0].products.length;
    console.log(noOfProducts);
    productData[0].products.map((p) => {
      let datecreated = p.date.getDate();
      let monthcreated = p.date.getMonth();
      let yearcreated = p.date.getFullYear();
      totalMoney += p.price;
      if (
        datecreated == selectedDate &&
        monthcreated + 1 == selectedMonth &&
        yearcreated == selectedYear
      ) {
        cnt[0] = cnt[0] + 1;
        amt[0] = amt[0] + p.price;
      }
      if (
        datecreated == selectedDate + 1 &&
        monthcreated + 1 == selectedMonth &&
        yearcreated == selectedYear
      ) {
        cnt[1] = cnt[1] + 1;
        amt[1] = amt[1] + p.price;
      }
      if (
        datecreated == selectedDate + 2 &&
        monthcreated + 1 == selectedMonth &&
        yearcreated == selectedYear
      ) {
        cnt[2] = cnt[2] + 1;
        amt[2] = amt[2] + p.price;
      }
      //dates.push({created:datecreated,sold:solddate,id:p._id});
    });
    var combined = [];
    combined.push(cnt);
    combined.push(amt);
    combined.push(noOfProducts);
    combined.push(totalMoney);
    res.send(combined);
  } catch (err) {
    res.json({ message: err });
  }
});

//avg of profit per product & avg of products per day
Router.get("/prod/avg/charts/:id", async (req, res, next) => {
  try {
    //const { _id } = req.client._doc;
    const { id } = req.params;
    const productData = await ProductDoc.find({ userId: id });

    var noOfProducts = productData[0].products.length;
    var totalProfit = 0;
    var startingdate = productData[0].products[0].date;
    var lastdate = productData[0].products[noOfProducts - 1].date;
    var differenceTime = lastdate.getTime() - startingdate.getTime();
    var differenceDays = Math.round(differenceTime / (1000 * 3600 * 24));

    productData[0].products.map((p) => {
      totalProfit += p.price;
    });
    var avg = {'avgprofit':totalProfit/noOfProducts,'avgprod': noOfProducts/differenceDays,'avgdayprofit': totalProfit/differenceDays};
    //avgprofit = total_profit/total_no_of_prod, avgprod = total_no_of_prod/total_no_of_days, avgdayprofit = total_profit/total_no_of_days
    res.send(avg);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = Router;
