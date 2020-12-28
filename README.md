### rainmaker:backtester

> backtest stratagies and plot graph in nodejs

#### usage

- Create a Strategy

```javascript
const { Strategy } = require('./backtester');

class MyStrategy extends Strategy {
    constructr(..args){
        super(...args);
    }
    next(){
   // logic
    }
}

```

And then

- Load data and create a Backtester instance

`const bt = genBackTest(data,MyStrategy,10000,0,0,5)`

And then

- Execute `bt.run()`
- Visual feedback use:`bt.plot()`

#### BackTester

- ` data:[[timestamp],[open],[high],[low],[close]]``Strategy - `bt.run()`
- `bt.plot()`

#### Strategy

- Strategy
- next()
- call every times in a cycle  
   `next()`

- use order

```javascript
entry(qty);
buy(qty);
sell(qty);
```
