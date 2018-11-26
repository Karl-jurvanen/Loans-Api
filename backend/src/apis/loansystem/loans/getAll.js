import mysql from 'mysql2/promise';
import Url from 'url';
import { connectionSettings } from '../../../settings';
import { loanSystem, loansPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { parseSortQuery, parseLoanById } from '../../../helpers';

export default loanSystem.get(`${loansPath}`, checkAccept, async (ctx) => {
  const url = Url.parse(ctx.url, true);
  const { sort } = url.query;

  const orderBy = parseSortQuery({
    urlSortQuery: sort,
    whitelist: ['id', 'firstName', 'lastName', 'role'],
  });

  try {
    // first call getDevices stored procedure that stores data we need into temporary table called
    // temp. Second query is to order the table based on orderBy.

    const conn = await mysql.createConnection(connectionSettings);

    const [data] = await conn.execute(`
            call getLoans();
          `);

    // Return all equipment parsed by id
    ctx.body = parseLoanById(data[0]);
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
