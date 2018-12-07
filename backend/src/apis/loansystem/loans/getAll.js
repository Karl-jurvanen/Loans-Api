import Url from 'url';
import { loanSystem, loansPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { getConnection } from '../../../sqlConnection';

export default loanSystem.get(`${loansPath}`, checkAccept, async (ctx) => {
  const url = Url.parse(ctx.url, true);

  const conn = await getConnection();
  try {
    // call getLoans stored procedure

    const [data] = await conn.execute(`
            call getLoans();
          `);
    ctx.body = data[0];
    console.error('Returned:', data);
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
