import mysql from 'mysql2/promise';
import Router from 'koa-router';
import JWT from 'jsonwebtoken';
import { connectionSettings } from '../../settings';
import {
  todosPath, todoPath, todos, koaBody,
} from '../constants';
import { checkAccept, checkContent, checkUser } from '../../middleware';

// POST /resource
export default todos.post(todosPath, checkAccept, checkContent, koaBody, async (ctx) => {
  checkUser(ctx);

  const { text } = ctx.request.body;
  const { authorization } = ctx.header;
  const token = authorization.split(' ')[1];
  console.log(token);
  console.log('.post text contains:', text);

  if (typeof text === 'undefined') {
    ctx.throw(400, 'body.text is required');
  } else if (typeof text !== 'string') {
    ctx.throw(400, 'body.done must be string');
  }

  try {
    const conn = await mysql.createConnection(connectionSettings);

    const decoded = JWT.decode(token);
    console.log(decoded);
    // Insert a new todo
    const [status] = await conn.execute(
      `
              INSERT INTO todos (text)
              VALUES (:text);
            `,
      { text },
    );
    const { insertId } = status;

    // Get the new todo
    const [data] = await conn.execute(
      `
              SELECT *
              FROM todos
              WHERE id = :id;
            `,
      { id: insertId },
    );

    // Set the response header to 201 Created
    ctx.status = 201;

    // Set the Location header to point to the new resource
    const newUrl = `${ctx.host}${Router.url(todoPath, { id: insertId })}`;
    ctx.set('Location', newUrl);

    // Return the new todo
    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
