import { loanSystem, loanPath } from '../../constants';
import { getConnection } from '../../../sqlConnection';

// DELETE /resource/:id/
export default loanSystem.del(loanPath, async (ctx) => {
  const { id } = ctx.params;
  console.log('.del id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }

  const conn = await getConnection();
  try {
    const [status] = await conn.execute(
      `
              DELETE FROM lainaus
              WHERE id = :id 
            `,
      { id },
    );

    if (status.affectedRows === 0) {
      // The row did not exist, return '404 Not found'
      ctx.status = 404;
    } else {
      // Return '204 No Content' status code for successful delete
      ctx.status = 204;
    }
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
