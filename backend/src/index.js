import 'babel-polyfill';
import Koa from 'koa';
import Router from 'koa-router';
import mysql from 'mysql2/promise';
// The port that this server will run on, defaults to 9000
const port = process.env.PORT || 9000;

// Instantiate a Koa server
const app = new Koa();

// Instantiate routers
const test = new Router();

// Define API path
const apiPath = '/api/v1';

const connectionSettings = {
  host: 'db',
  user: 'root',
  database: 'db_1',
  password: process.env.MYSQL_ROOT_PASSWORD,
  namedPlaceholders: true,
};

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

app.use(test.routes());
app.use(test.allowedMethods());

// Start the server and keep listening on port until stopped
app.listen(port);

console.log(`App listening on port ${port}`);
