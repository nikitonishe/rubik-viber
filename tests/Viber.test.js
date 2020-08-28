/* global describe test expect */
const path = require('path');
const { Kubiks: { Config } } = require('rubik-main');

const { createApp, createKubik } = require('rubik-main/tests/helpers/creators');

const Viber = require('../classes/Viber.js');

const CONFIG_VOLUMES = [
  path.join(__dirname, '../default/'),
  path.join(__dirname, '../config/')
];

const get = () => {
  const app = createApp();
  app.add(new Config(CONFIG_VOLUMES));

  const kubik = createKubik(Viber, app);

  return { app, kubik };
}

describe('Кубик для работы с Viber', () => {
  test('Создается без проблем и добавляется в App', () => {
    const { app, kubik } = get();
    expect(app.viber).toBe(kubik);
    expect(app.get('viber')).toBe(kubik);
  });

  test('Делает тестовый запрос к viber (не забудьте добавить токен в настройки)', async () => {
    const { app, kubik } = get();
    await app.up();
    const response = await kubik.pa.getAccountInfo({});
    expect(response.status_message).toBe('ok');
    await app.down();
  });

  test('Тестовый запрос к viber с невалидным токеном завершается ошибкой', async () => {
    const { app, kubik } = get();
    await app.up();
    expect(kubik.pa.getAccountInfo({}, '12345')).rejects.toThrow();
    await app.down();
  });
});
