import { loanSystem, loanPath } from '../../constants';
import { checkAccept, checkUser } from '../../../middleware';
import { getConnection } from '../../../sqlConnection';

export default loanSystem.get(`${loanPath}`, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  console.log('.get id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }
  const conn = await getConnection();
  try {
    // call stored procedure getLoan(:id) that contains query for getting a loan
    const [data] = await conn.execute(
      `
        call getLoan(:id);
          `,
      { id },
    );
    const body = data[0][0];
    // check if user is the loaner
    if (typeof body !== 'undefined') {
      await checkUser(ctx, body.loanerId);
    } else {
      await checkUser(ctx);
    }
    ctx.body = body;
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
