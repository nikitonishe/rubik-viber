const { Kubik } = require('rubik-main');
const parseUrl = require('url').parse;
const fetch = require('node-fetch');
const set = require('lodash/set');
const isObject = require('lodash/isObject');
const methods = require('./Viber/methods');

const ViberError = require('../errors/ViberError');

const DEFAULT_HOST = 'https://chatapi.viber.com';

/**
 * Кубик для запросов к API ботов Viber
 * @class
 * @prop {String} [token] токен для доступа к API
 * @prop {String} [host=DEFAULT_HOST] адрес API Viber
 */
class Viber extends Kubik {
  constructor(token, host) {
    super(...arguments);
    this.token = token || null;
    this.host = host || null;

    this.methods.forEach(this.generateMethod, this);
  }

  /**
   * Поднять кубик
   * @param  {Object} dependencies зависимости
   */
  up({ config }) {
    this.config = config;

    const options = this.config.get(this.name);

    this.token = this.token || options.token || null;
    this.host = this.host || options.host || DEFAULT_HOST;
  }

  getUrl(path, host) {
    if (!host) host = this.host;

    if (!host) throw new TypeError('host is not defined');

    const url = new URL(path, host);
    return `${url}`;
  }

  /**
   * Сделать запрос к API Viber
   * @param  {String} name  имя метода
   * @param  {Object|String} body тело запроса
   * @param  {String} [token=this.token] токен для запроса
   * @param  {String} [host=this.host] хост API Viber
   * @return {Promise<Object>} ответ от Viber API
   */
  async request(name, body, token, host) {
    if (isObject(body)) {
      body = JSON.stringify(body);
    }

    const url = this.getUrl(name, host);

    let method = 'GET';
    const headers = { 'X-Viber-Auth-Token': token || this.token };

    if (body) {
      method = 'POST';
      headers['Content-Length'] = Buffer.byteLength(body);
      headers['Content-Type'] = 'application/json'
    }

    let request;
    const config = this.config.get(this.name);
    if (config.proxy?.url) {
      const parsedUrl = parseUrl(url);

      headers['X-Target-Host'] = headers.Host || parsedUrl.host;
      headers['X-Target'] = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;

      request = await fetch(config.proxy.url, { method, body, headers });
    } else {
      request = await fetch(url, { method, body, headers });
    }

    const result = await request.json();

    if (result.status_message !== 'ok') throw new ViberError(result.status_message);
    return result;
  }

  /**
   * Сгенерировать метод API
   *
   * Создает функцию для запроса к API, привязывает ее к текущему контексту
   * и кладет в семантичное имя внутри this.
   * В итоге он разбирет путь на части, и раскладывает его по семантичным объектам:
   * one/two/three -> this.one.two.three(currency, body, id);
   * @param  {String}  path путь запроса, без ведущего /: one/two/three
   */
  generateMethod({ kubikName, apiName }) {
    const method = (body, token, host) => {
      return this.request(apiName, body, token, host);
    };
    set(this, kubikName, method);
  }
}


// Чтобы не создавать при каждой инициализации класса,
// пишем значения имени и зависимостей в протип
Viber.prototype.dependencies = Object.freeze(['config']);
Viber.prototype.methods = Object.freeze(methods);
Viber.prototype.name = 'viber';

module.exports = Viber;
