import mysql from 'mysql2/promise';
import { connectionSettings } from '../../../settings';
import { loanSystem, userPath } from '../../constants';

// DELETE /resource/:id/
export default loanSystem.del(userPath, async (ctx) => {
  const { id } = ctx.params;
  console.log('.del id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }

  try {
    const conn = await mysql.createConnection(connectionSettings);
    const [status] = await conn.execute(
      `
              DELETE FROM henkilo
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
    if (error.errno === 1451) {
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(400, 'Cannot delete user with existing loans');
    }
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
