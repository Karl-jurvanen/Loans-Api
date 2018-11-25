import mysql from 'mysql2/promise';
import Url from 'url';
import { connectionSettings } from '../../../settings';
import { loanSystem, usersPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { parseSortQuery } from '../../../helpers';

export default loanSystem.get(`${usersPath}`, checkAccept, async (ctx) => {
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
            SELECT 
                id,
                etunimi AS 'firstName',
                sukunimi AS 'lastName',
                rooli AS 'role'
            FROM henkilo
            ${orderBy};
          `);

    // Return all equipment parsed by id
    ctx.body = data;
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
