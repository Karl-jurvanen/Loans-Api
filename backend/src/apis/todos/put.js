import mysql from 'mysql2/promise';
import { connectionSettings } from '../../settings';
import { todoPath, todos, koaBody } from '../constants';
import { checkAccept, checkContent } from '../../middleware';

// PUT /resource/:id
export default todos.put(todoPath, checkAccept, checkContent, koaBody, async (ctx) => {
  const { id } = ctx.params;
  const { text, done } = ctx.request.body;
  console.log('.put id contains:', id);
  console.log('.put text contains:', text);
  console.log('.put done contains:', done);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  } else if (typeof text === 'undefined') {
    ctx.throw(400, 'body.text is required');
  } else if (typeof text !== 'string') {
    ctx.throw(400, 'body.done must be string');
  } else if (typeof done === 'undefined') {
    ctx.throw(400, 'body.done is required');
  } else if (typeof done !== 'boolean') {
    ctx.throw(400, 'body.done must be boolean');
  }

  try {
    const conn = await mysql.createConnection(connectionSettings);

    // Update the todo
    const [status] = await conn.execute(
      `
               UPDATE todos
               SET text = :text, done = :done
               WHERE id = :id;
             `,
      { id, text, done: Number(done) },
    );

    if (status.affectedRows === 0) {
      // If the resource does not already exist, create it
      await conn.execute(
        `
              INSERT INTO todos (id, text, done)
              VALUES (:id, :text, :done);
            `,
        { id, text, done: Number(done) },
      );
    }

    // Get the todo
    const [data] = await conn.execute(
      `
               SELECT *
               FROM todos
               WHERE id = :id;
             `,
      { id },
    );

    // Return the resource
    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
