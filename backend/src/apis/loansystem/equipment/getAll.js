import mysql from 'mysql2/promise';
import Url from 'url';
import { connectionSettings } from '../../../settings';
import { loanSystem, equipmentsPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { parseSortQuery } from '../../../helpers';

export default loanSystem.get(`${equipmentsPath}`, checkAccept, async (ctx) => {
  const url = Url.parse(ctx.url, true);
  const { sort } = url.query;

  // const orderBy = parseSortQuery({ urlSortQuery: sort, whitelist: ['id', 'done'] });

  try {
    const conn = await mysql.createConnection(connectionSettings);
    const [data] = await conn.execute(`
                call getDevices();
            `);

    // Return all todos
    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
