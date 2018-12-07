import Url from 'url';
import { loanSystem, equipmentsPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { parseSortQuery, parseEquipmentById } from '../../../helpers';
import { getConnection } from '../../../sqlConnection';

export default loanSystem.get(`${equipmentsPath}`, checkAccept, async (ctx) => {
  const url = Url.parse(ctx.url, true);
  const { sort } = url.query;

  const orderBy = parseSortQuery({
    urlSortQuery: sort,
    whitelist: ['id', 'code', 'name', 'info'],
  });

  const conn = await getConnection();
  try {
    // first call getDevices stored procedure that stores data we need into temporary table called
    // temp. Second query is to order the table based on orderBy.

    await conn.execute(`
              call getDevices();
            `);

    const [data] = await conn.execute(`
            SELECT * 
            FROM temp
            ${orderBy};
          `);

    // Return all equipment parsed by id
    ctx.body = parseEquipmentById(data);
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
