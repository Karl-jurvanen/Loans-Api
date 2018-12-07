import mysql from 'mysql2/promise';
import { connectionSettings } from '../../settings';
import { test, apiPath } from '../constants';
import { checkAccept } from '../../middleware';

export default test.get(`${apiPath}/test/:id`, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  console.log('.get id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }
  try {
    const conn = await mysql.createConnection(connectionSettings);
    // call GetDevices();
    const [data] = await conn.execute(
      `
        call getDevice(:id);
          `,
      { id },
    );

    // Return all todos
    ctx.body = data[0][0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
