import { loanSystem, equipmentAdminPath } from '../../../constants';
import { checkAccept } from '../../../../middleware';
import { getConnection } from '../../../../sqlConnection';

export default loanSystem.get(`${equipmentAdminPath}`, checkAccept, async (ctx) => {
  const { id, adminId } = ctx.params;

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  } else if (isNaN(adminId) || adminId.includes('.')) {
    ctx.throw(400, 'admin id must be an integer');
  }

  const conn = await getConnection();

  try {
    const [data] = await conn.execute(
      `
    SELECT 
        henkilo.id,
        henkilo.etunimi AS 'firstName',
        henkilo.sukunimi AS 'lastName'
    FROM
        laite,
        vastuuhenkilo,
        henkilo
    WHERE
        laite.id = vastuuhenkilo.laite_id
        AND henkilo.id = vastuuhenkilo.henkilo_id
        AND henkilo.id = :adminId
        AND laite.id = :id;
            `,
      { id, adminId },
    );

    // if sql query returns values, return the sql result,
    // else set body to null so a 204 is sent
    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
