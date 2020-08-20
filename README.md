# rubik-viber
Viber's Bot API kubik for the Rubik

## Install

### npm
```bash
npm i rubik-viber
```

### yarn
```bash
yarn add rubik-viber
```

## Use
```js
const { App, Kubiks } = require('rubik-main');
const Viber = require('rubik-viber');
const path = require('path');

// create rubik app
const app = new App();
// config need for most modules
const config = new Kubiks.Config(path.join(__dirname, './config/'));

const viber = new Viber();

app.add([ config, viber ]);

app.up().
then(() => console.info('App started')).
catch(err => console.error(err));
```

## Config
`viber.js` config in configs volume may contain the host and token.

If you do not specify a host, then `https://chatapi.viber.com/` will be used by default.

If you don't specify a token, you will need to pass it.
```js
...
const response = await app.get('viber').get_account_info({});
...
```

You may need the host option if for some reason Viber host is not available from your server
and you want to configure a proxy server.


For example:
`config/viber.js`
```js
module.exports = {
  host: 'https://my.viber.proxy.example.com/'
};
```

## Extensions
Viber kubik doesn't has any extension.
