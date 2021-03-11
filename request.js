const crypto = require('crypto');
const got = require('got');
const querystring = require('querystring');
const config = require('./config');

const USER_AGENT = 'bfp@1.0.0';
const URL = "https://api.bybit.com";

module.exports = class BybitRest {
  constructor() {
    this.ua = USER_AGENT;
    this.timeout = 10 * 1000;
    this.expiration = 60 * 1000;

    this.key = config.APIKEY;
    this.secret = config.PRIVATEKEY;
  }

  async send(method, path, data={}) {
    const start = Date.now();

    data.api_key = this.key;
    data.recv_window = this.expiration;
    data.timestamp = start;

    const message = Object.keys(data)
      .map(key => `${key}=${data[key]}`)
      .sort()
      .join('&');

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');

    data.sign = signature;

    const options = {
      headers: {
        'User-Agent': this.ua,
        'content-type' : 'application/json'
      },
      method,
      responseType: 'json'
    }

    if(method === 'GET') {
      path += '?' + querystring.stringify(data);
    } else {
      options.json = data;
    }

    try {
      const { body } = await got(`${URL}${path}`, options);
      return body;
    }
    catch (error)
    {
      console.log(error.body || error);
      return null;
    }
  }
}
