import 'babel-polyfill';
import Koa from 'koa';
import Router from 'koa-router';

// The port that this server will run on, defaults to 9000
const port = process.env.PORT || 9000;

// Instantiate a Koa server
const app = new Koa();

// Instantiate routers
const test = new Router();

// Define API path
const apiPath = '/api/v1';

test.get(`${apiPath}/test`, async (ctx) => {
  // Tell the HTTP response that it contains JSON data encoded in UTF-8
  ctx.type = 'application/json; charset=utf-8';

  // Put a static greeting message to the HTTP response body that will be sent to the browser
  // when a client navigates to http://hostname/api/v1/test
  ctx.body = { greeting: 'Hello world!' };
});

app.use(test.routes());
app.use(test.allowedMethods());

// Start the server and keep listening on port until stopped
app.listen(port);

console.log(`App listening on port ${port}`);
