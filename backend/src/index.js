import 'babel-polyfill';
import Koa from 'koa';
import { initDB } from './fixtures';
import { databaseReady } from './helpers';
import { test, todos } from './apis';

// Initialize DB
(async () => {
  await initDB();
  await databaseReady();
})();

// The port that this server will run on, defaults to 9000
const port = process.env.PORT || 9000;

// Instantiate a Koa server
const app = new Koa();

app.use(test.routes());
app.use(test.allowedMethods());
app.use(todos.routes());
app.use(todos.allowedMethods());
// Start the server and keep listening on port until stopped
app.listen(port);

console.log(`App listening on port ${port}`);
