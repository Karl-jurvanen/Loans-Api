import Url from 'url';
import { loanSystem, usersPath } from '../../constants';
import { getConnection } from '../../../sqlConnection';
import { checkAccept } from '../../../middleware';
import { parseSortQuery } from '../../../helpers';

export default loanSystem.get(`${usersPath}`, checkAccept, async (ctx) => {
  const url = Url.parse(ctx.url, true);
  const { sort } = url.query;

  const orderBy = parseSortQuery({
    urlSortQuery: sort,
    whitelist: ['id', 'firstName', 'lastName', 'role', 'email', 'adminStatus'],
  });

  const conn = await getConnection();
  try {
    const [data] = await conn.execute(`
            SELECT 
                id,
                etunimi AS 'firstName',
                sukunimi AS 'lastName',
                rooli AS 'role',
                email, 
                adminStatus
            FROM henkilo
            ${orderBy};
          `);

    // Return all equipment parsed by id
    ctx.body = data;
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
