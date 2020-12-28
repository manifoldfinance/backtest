'use strict';

/* class Strategy {
    constructor(ohlcv, option) {
        this.ohlcv = ohlcv;
        this.option = option;
    }
} */

class Backtest {
    constructor(ohlcv, profit, loss, dd) {
        this.ohlcv = ohlcv;
        this.profit = profit;
        this.loss = loss;
        this.dd = dd;
    }
    runTest() {
    }
    addOhlcv(ohlcv) {
        this.ohlcv = ohlcv
        console.log('backtsting');
    }
}
class Strategy extends Backtest {
    constructor(...args) {
        super(...args);
    }
    sma() { }
    next() { console.log('next'); }
    init() { }
    addOhlcv() {
        super.addOhlcv([0, 0, 0, 0])
        console.log('addOhlcv');
    }
}

class MyStrategy extends Strategy {
    constructor(...args) {
        super(...args);
    }
    next() {
        super.next()
        console.log('next');
        /* アルゴでBuy sell */
    }
    init() { }
    /*  Backtest Classでの実装 
    addOhlcv() {
            super.addOhlcv()
        } */
}

let instance = new MyStrategy([1, 2, 3, 4,], 123, -123, 0)
console.log('instance :>> ', instance);
instance.next()
instance.addOhlcv()

// console.log(instance instanceof Strategy);
// console.log(instance instanceof Backtest); 