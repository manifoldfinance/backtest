"use strict";
const nodeplotlib = require("nodeplotlib");

/**
 *
 * @param {Number[][]} data APIcandle[[timstamp,open,high,low,close]]
 * @param {Strategy} parentClass Strategy
 * @param {number} balance initial balance
 * @param {number} commsion
 * @param {number} pyramiding
 * @param {number} from data
 */
function genBackTest(data, parentClass, balance, commsion, pyramiding, from) {
  /**
   * @property {Number[][]} data [[open],[high],,,]  fromdata run() new->old
   * @property {Number[][]} ohlcv [[open],[high],,,] run()data old->new
   */
  return new (class BackTester extends parentClass {
    /**
     * @constructor
     * @param {Number[][]} data APIcandle[[timstamp,open,high,low,close]]
     * @param {number} balance initial balance
     * @param {number} commsion
     * @param {number} pyramiding
     * @param {number} from data
     */
    constructor(data, balance, commsion, pyramiding, from) {
      super(balance, commsion, pyramiding, from);
      this.from;
      this.timestamp = []; //new->old
      this.open = [];
      this.high = [];
      this.low = [];
      this.close = [];
      this.volume = [];
      this.data; //new->old
      this.ohlcv; //old->new
      super.initIndi(data, from); //
      this.initOhlcv(data); //ohlcv
      console.log("this.ttmHistory :>> ", this.ttmHistory.length);
      console.log("this.data.length :>> ", this.data.length);
    }
    /** ohlcv
     * initIndithis.from
     * @param {number[][]} data  APIcandle[[timstamp,open,high,low,close]]
     */
    initOhlcv(data) {
      // this.data = data.slice(this.from,).reverse() //this.data new->old //data old->new
      // this.ohlcv = data.slice(0, this.from).reverse();// new->old
      this.data = data;
      const pre = this.data.splice(0, this.from).reverse();
      this.ohlcv = pre;
      this.data = data.reverse(); //this.data new->old //data old->new
      this.parseOhlcv();
    }
    run() {
      const length = this.data.length;
      for (let i = 0; i < length; i++) {
        // this.print()
        super.next();
        this.updateBalance();
        this.updateDrawDown();
        super.updateIndi();
        this.updateOhlcv();
      }
      this.valuate();
    }
    // addOhlcv(ohlcv) {
    //     this.ohlcv = ohlcv
    // }
    print() {
      // console.log(
      //     'this.timestamp[0] :>> ', this.timestamp[0],
      //     'ttm  len',this.ttm.length,
      //     //     //     'i :>> ', i,
      //     'b len', this.buyPnL.length - 1,
      //     //     's len', this.sellPnL.length - 1,
      //     //     'provisonal len', this.netBalance.length - 1,
      //     'ohlcv len', this.ohlcv.length - 1,
      //     'data len', this.data.length - 1,
      //     //     // '.buyPnL[]', this.buyPnL[this.buyPnL.length - 1],
      //     //     // '.sellPnL[]', this.sellPnL[this.sellPnL.length - 1],
      //     //     // 'provisional[pre last]:>> ', this.provisionalBalance[this.provisionalBalance.length - 2],
      //     //     // 'provisional[last]:>> ', this.provisionalBalance[this.provisionalBalance.length - 1],
      //     //     //     //     'this.data.length :>> ', this.data.length,
      //     //     //     //     'this.data[] :>> ', this.data[this.data.length - 1],
      //     // 'this.open[0] :>> ', this.open[0],
      // )
    }
    parseOhlcv() {
      const length = this.ohlcv.length;
      for (let i = 0; i < length; i++) {
        const el = this.ohlcv[i];
        this.timestamp.push(el[0]);
        this.open.push(el[1]);
        this.high.push(el[2]);
        this.low.push(el[3]);
        this.close.push(el[4]);
        this.volume.push(el[5]);
      }
    }
    updateOhlcv() {
      //next new
      const next = this.data.pop();
      this.ohlcv.unshift(next);
      this.timestamp.unshift(next[0]);
      this.open.unshift(next[1]);
      this.high.unshift(next[2]);
      this.low.unshift(next[3]);
      this.close.unshift(next[4]);
      this.volume.unshift(next[5]);
    }
    updateDrawDown() {
      const dd = this.maxBalance - this.netBalance[this.netBalance.length - 1];
      if (dd - this.maxDD > 0) this.maxDD = dd;
    }
    report() {
      return this.netBalance;
    }
    plot() {
      const data = [
        { x: [...this.netBalance.keys()], y: this.netBalance, type: "line" },
      ];
      nodeplotlib.plot(data);
    }
  })(data, balance, commsion, pyramiding, from);
}

class TradeManagement {
  constructor(balance, commsion, pyramiding, from) {
    this.balance = balance;
    this.commsion = commsion;
    this.pyramiding = pyramiding;
    this.buyPnL = [0];
    this.sellPnL = [0];
    this.maxDD = 0;
    this.maxBalance = balance;
    this.netBalance = Array(from - 1).fill(balance);
    this.position = { timestamp: 0, qty: 0, aveOpenPrice: 0 };
  }

  entry(qty) {
    // const prevQty = this.position['qty'];
    // const qty = ordQty > 0 ? -ordQty : ordQty;
    // this._entry(qty, (ordQty > 0 ? 1 : -1) * prevQty);
    return qty > 0 ? this.buy(qty) : this.sell(qty);
  }
  _entry(qty, prevQty) {
    const length = this.data.length;
    const open = this.data[length - 1][1];
    let pnl = 0;
    //
    if (prevQty == 0) {
      this.position["timestamp"] = this.data[length - 1][0];
      this.position["aveOpenPrice"] = open;
      this.position["qty"] = qty;
    }
    // position
    if (prevQty < 0) {
      pnl = this.calcPnL(open, prevQty);
      this.position["timestamp"] = this.data[length - 1][0];
      this.position["aveOpenPrice"] = open;
      this.position["qty"] = qty;
    }
    //position
    /**@todo  */
    if (prevQty > 0 && Math.abs(qty) < this.pyramiding) {
      this.position["aveOpenPrice"] =
        (this.position["aveOpenPrice"] * prevQty + open * qty) /
        (prevQty + qty);
      this.position["qty"] += qty;
    }
    return pnl;
  }
  buy(qty) {
    const prevQty = this.position["qty"];
    const pnl = this._entry(qty, prevQty);
    // this.sellPnL[this.ohlcv.length - 1] = pnl;
    // this.buyPnL[this.ohlcv.length - 1] = 0;
    this.sellPnL.push(pnl);
    this.buyPnL.push(0);
    // this.updateBalance(pnl);
  }
  sell(ordQty) {
    const qty = ordQty > 0 ? -ordQty : ordQty;
    const prevQty = this.position["qty"];
    const pnl = -1 * this._entry(qty, -prevQty);
    this.buyPnL.push(pnl);
    this.sellPnL.push(0);
    // this.buyPnL[this.ohlcv.length - 1] = pnl;
    // this.sellPnL[this.ohlcv.length - 1] = 0;
    // this.updateBalance(pnl);
  }
  updateBalance() {
    let pnl = 0;
    if (this.position["timestamp"] >= this.timestamp[0]) {
      //buyPnLproviBalace
      // if (this.position['timestamp'] >= this.timestamp[this.timestamp.length - 1]) {
      // this.buyPnL.push(0);
      // this.sellPnL.push(0);
      // }
      const pnlLength = this.buyPnL.length;
      pnl = this.buyPnL[pnlLength - 1] + this.sellPnL[pnlLength - 1];
    }
    const length = this.netBalance.length;
    const balance = this.netBalance[length - 1] + pnl;
    this.netBalance.push(balance);
  }
  // getBalance() {
  //     return this.provisionalBalance[this.ohlcv.length - 1];
  // }
  calcPnL(exitPrice, qty) {
    return qty * (exitPrice - this.position["aveOpenPrice"]);
  }
  calcPercent(numerator, denominator, digit = 0) {
    return (
      Math.round((100 * 100 * 10 ** digit * numerator) / denominator) /
      (100 * 10 ** digit)
    );
  }
  valuate() {
    //buyPnl
    const winBuyPnL = this.buyPnL.filter((el) => el > 0);
    const lossBuyPnL = this.buyPnL.filter((el) => el < 0);
    const winSellPnL = this.sellPnL.filter((el) => el > 0);
    const lossSellPnL = this.sellPnL.filter((el) => el < 0);

    const tradeCount =
      winBuyPnL.length +
      lossBuyPnL.length +
      winSellPnL.length +
      lossSellPnL.length;
    //
    const winRatio =
      this.calcPercent(winBuyPnL.length + winSellPnL.length, tradeCount) / 100;
    //
    const buyProfit = winBuyPnL.reduce((accu, current) => accu + current, 0);
    const sellProfit = winSellPnL.reduce((accu, current) => accu + current, 0);
    //
    const buyLoss = lossBuyPnL.reduce((accu, current) => accu + current, 0);
    const sellLoss = lossSellPnL.reduce((accu, current) => accu + current, 0);
    //
    const totalReturn = this.netBalance[this.netBalance.length - 1];
    const buyReturn = buyProfit + buyLoss;
    const sellReturn = sellProfit + sellLoss;
    //
    const profitFactor =
      -this.calcPercent(buyProfit + sellProfit, buyLoss + sellLoss) / 100;
    //DD:
    const ddPercent = this.calcPercent(
      this.maxBalance - this.maxDD,
      this.maxBalance
    );

    console.log(`
        ------------------------------
        candles:${this.netBalance.length}
        initial balance:${this.balance}
        total return:${totalReturn} (${this.calcPercent(
      totalReturn - this.balance,
      this.balance,
      2
    )}%)
        PF:${profitFactor}
        max draw down:${this.maxDD} (${ddPercent}%)
        win ration:${winRatio}
        trade counts:${tradeCount}
        ------------------------------
                        long   
        total             |${buyReturn}  (${this.calcPercent(
      buyReturn,
      this.balance
    )}%)
        profit            |${buyProfit}  (${this.calcPercent(
      buyProfit,
      this.balance
    )}%)
        loss              |${buyLoss}  (${this.calcPercent(
      buyLoss,
      this.balance
    )}%)
        trade count       |${winBuyPnL.length + lossBuyPnL.length}
        trade win count   |${winBuyPnL.length}
        trade loss count  |${lossBuyPnL.length}
        -------------------------------
                        short
        total             |${sellReturn} (${this.calcPercent(
      sellReturn,
      this.balance
    )}%)
        profit            |${sellProfit} (${this.calcPercent(
      sellProfit,
      this.balance
    )}%)
        loss              |${sellLoss} (${this.calcPercent(
      sellLoss,
      this.balance
    )}%)
        trade count       |${winSellPnL.length + lossSellPnL.length}
        trade win count   |${winSellPnL.length}
        trade loss count  |${lossSellPnL.length}
        `);
    // console.log('this.buyPnL :>> ', this.buyPnL);
    // console.log('this.sellPnL :>> ', this.sellPnL);
  }
}

module.exports = { genBackTest, TradeManagement };
