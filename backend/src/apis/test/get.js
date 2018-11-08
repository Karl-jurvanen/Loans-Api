import mysql from 'mysql2/promise';
import Router from 'koa-router';
import { connectionSettings } from '../../settings';
import { test, apiPath } from '../constants';


test.get(`${apiPath}/test`, async (ctx) => {
  // Tell the HTTP response that it contains JSON data encoded in UTF-8
  try {
    const conn = await mysql.createConnection(connectionSettings);
    const [data] = await conn.execute(`
            SELECT *
            FROM test_table
          `);

    console.log('Data fetched:', data);

    // Tell the HTTP response that it contains JSON data encoded in UTF-8
    ctx.type = 'application/json; charset=utf-8';

    // Add stuff to response body
    ctx.body = { greeting: 'Hello world!', data };
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});

export default test;
