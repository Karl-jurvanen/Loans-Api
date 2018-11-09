import mysql from 'mysql2/promise';
import Url from 'url';
import { connectionSettings } from '../../settings';
import { todosPath, todos } from '../constants';
import { checkAccept } from '../../middleware';
import { parseSortQuery } from '../../helpers';

// GET /resource
export default todos.get(todosPath, checkAccept, async (ctx) => {
  const url = Url.parse(ctx.url, true);
  const { sort } = url.query;

  const orderBy = parseSortQuery({ urlSortQuery: sort, whitelist: ['id', 'done'] });

  try {
    const conn = await mysql.createConnection(connectionSettings);
    const [data] = await conn.execute(`
            SELECT *
            FROM todos
            ${orderBy}
          `);

    // Return all todos
    ctx.body = data;
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
