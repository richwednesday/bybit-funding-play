# bybit-funding-play
A script to collect funding by shorting perps on bybit exchange | hedge by longing futures.  
Reduce trade fees by submiting a limit order for one contract and a market order for other contract once limit order is filled. 

create a `config.js` file like below:

```
module.exports = {
  APIKEY: "", // your bybit api key
  PRIVATEKEY: "", // your bybit api secret
  TRADEQTY: 2000, // usd value
  FUTURETICKER: "BTCUSDM21" // "BTCUSD0625"
}
```

run `node index.js`
