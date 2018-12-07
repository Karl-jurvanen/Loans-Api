import { loanSystem, equipmentAdminPath } from '../../../constants';
import { getConnection } from '../../../../sqlConnection';
// DELETE /resource/:id/admins/:adminId
export default loanSystem.del(equipmentAdminPath, async (ctx) => {
  const { id, adminId } = ctx.params;
  console.log('.del id contains:', id);
  console.log('.del adminId contains:', adminId);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  } else if (isNaN(adminId) || adminId.includes('.')) {
    ctx.throw(400, 'adminId must be an integer');
  }

  const conn = await getConnection();

  try {
    const [status] = await conn.execute(
      `
              DELETE FROM vastuuhenkilo
              WHERE laite_id = :id 
              AND henkilo_id = :adminId;
            `,
      { id, adminId },
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
