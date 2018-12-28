import Url from 'url';
import { loanSystem, loansPath } from '../../constants';
import { checkAccept, getUserId } from '../../../middleware';
import { getConnection } from '../../../sqlConnection';

export default loanSystem.get(`${loansPath}`, checkAccept, async (ctx) => {
  const userId = await getUserId(ctx);
  const conn = await getConnection();
  try {
    // call getLoans stored procedure

    let data;
    // userId is -1 for an admin, show all loans
    if (userId === -1) {
      [data] = await conn.execute(`
            call getLoans();
          `);
    } else {
      [data] = await conn.execute(
        `
            call GetMyLoans(:userId);
          `,
        { userId },
      );
    }

    ctx.body = data[0];
    console.error('Returned:', data);
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
