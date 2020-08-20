const { Kubik } = require('rubik-main');
const fetch = require('node-fetch');
const isObject = require('lodash/isObject');

const methods = require('./Viber/methods');

const ViberError = require('../errors/ViberError');

const DEFAULT_HOST = 'https://chatapi.viber.com/';

/**
 * Кубик для запросов к API ботов Телеграма
 * @class
 * @prop {String} [token] токен для доступа к API
 * @prop {String} [host=DEFAULT_HOST] адрес API Viber
 */
class Viber extends Kubik {
  constructor(token, host) {
    super(...arguments);
    this.token = token || null;
    this.host = host || null;
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

  getUrl(name, host) {
    if (!host) host = this.host;

    if (!host) throw new TypeError('host is not defined');

    return `${host}pa/${name}`;
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

    const request = await fetch(url, { method, body, headers });
    const result = await request.json();

    if (result.status_message !== 'ok') throw new ViberError(result.status_message);
    return result;
  }
}

// Перебираем список имен методов API,
// создаем методы класса и внедряем их в прототип
methods.forEach((name) => {
  // Если мы переопределили поведение метода в классе по какой-то причине,
  // то не нужно ничего переписывать в прототипе
  if (Viber.prototype[name]) return;
  Viber.prototype[name] = async function(body, token, host) {
    return this.request(name, body, token, host);
  }
});

// Чтобы не создавать при каждой инициализации класса,
// пишем значения имени и зависимостей в протип
Viber.prototype.dependencies = Object.freeze(['config']);
Viber.prototype.name = 'viber';

module.exports = Viber;
