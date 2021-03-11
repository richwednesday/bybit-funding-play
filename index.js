const BybitRest = require('./request');
const client = new BybitRest();
const { TRADEQTY, FUTURETICKER } = require('./config');

async function start() {
  // get position of perp
  const perp_posp = await client.send('GET', '/v2/private/position/list', {
    symbol: 'BTCUSD'
  })
  if (!perp_posp.result)
    return console.log(perp_posp);

  // get position of future
  const future_posp = await client.send('GET', '/futures/private/position/list', {
    symbol: FUTURETICKER
  })
  console.log(future_posp.result[0].data);
  if (!future_posp.result)
    return console.log(future_posp);

  if (perp_posp.result.size < TRADEQTY)
  {
    // cancel any existing order on perp 
    const cancel = await client.send('POST', '/v2/private/order/cancelAll', { 
      symbol: 'BTCUSD'
    })
    console.log(cancel);

    // get perp order-book
    const orderbook = await client.send('GET', '/v2/public/orderBook/L2', {
      symbol: 'BTCUSD'
    })

    // submit limit sell order for perp at best possible price
    const order = await client.send('POST', '/v2/private/order/create', { 
      symbol: 'BTCUSD',
      side: 'Sell',
      order_type: 'Limit',
      qty: (TRADEQTY - perp_posp.result.size),
      price: Number(orderbook.result[0].price) + 0.5,
      time_in_force: "PostOnly" 
    })
    console.log(order);
  }

  else if (future_posp.result[0].data.size < perp_posp.result.size)
  {
    // perp position has been filled
    // market buy on future
    const order = await client.send('POST', '/futures/private/order/create', { 
      position_idx: 0,
      symbol: FUTURETICKER,
      side: 'Buy',
      order_type: 'Market',
      qty: (perp_posp.result.size - future_posp.result[0].data.size),
      time_in_force: "GoodTillCancel" 
    })
    console.log(order)
  }

  else
    process.exit(); 
}

start()
setInterval(start, 10000);