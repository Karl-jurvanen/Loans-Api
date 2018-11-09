
import mysql from 'mysql2/promise';
import { connectionSettings } from '../../settings';
import { todoPath, todos } from '../constants';
import { checkAccept } from '../../middleware';

// GET /resource/:id

export default todos.get(todoPath, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  console.log('.get id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }

  try {
    const conn = await mysql.createConnection(connectionSettings);
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
