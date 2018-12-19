import 'babel-polyfill';
import Koa from 'koa';
import Cors from '@koa/cors';
import { initDB } from './fixtures';
import { databaseReady } from './helpers';
import { jwt } from './middleware';
import {
  test, todos, loanSystem, login,
} from './apis';

// Initialize DB
(async () => {
  await databaseReady();
  await initDB();
})();

// The port that this server will run on, defaults to 9000
const port = process.env.PORT || 9000;

// Instantiate a Koa server
const app = new Koa();
const cors = new Cors();
// set CORS headers so the api endpoints can be accessed from application

app.use(cors);
app.use(login.routes());
app.use(login.allowedMethods());
app.use(test.routes());
app.use(test.allowedMethods());
app.use(jwt);
app.use(todos.routes());
app.use(todos.allowedMethods());
app.use(loanSystem.routes());
app.use(loanSystem.allowedMethods());

// Start the server and keep listening on port until stopped
app.listen(port);

console.log(`App listening on port ${port}`);
