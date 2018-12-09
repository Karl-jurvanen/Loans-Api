import 'babel-polyfill';
import Koa from 'koa';
import { initDB } from './fixtures';
import { databaseReady } from './helpers';
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

// set CORS headers so the api endpoints can be accessed from application
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Access, Authorization',
  );
  await next();
});

// app.use(cors({ origin: false, credentials: true }));
app.use(login.routes());
app.use(login.allowedMethods());
app.use(test.routes());
app.use(test.allowedMethods());
app.use(todos.routes());
app.use(todos.allowedMethods());
app.use(loanSystem.routes());
app.use(loanSystem.allowedMethods());

// Start the server and keep listening on port until stopped
app.listen(port);

console.log(`App listening on port ${port}`);
