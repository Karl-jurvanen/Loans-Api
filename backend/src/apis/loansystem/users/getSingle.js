import { loanSystem, userPath } from '../../constants';
import { getConnection } from '../../../sqlConnection';
import { checkAccept, checkUser } from '../../../middleware';

export default loanSystem.get(`${userPath}`, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  console.log('.get id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }
  await checkUser(ctx, id);

  const conn = await getConnection();
  try {
    const [data] = await conn.execute(
      `
      SELECT 
        id,
        etunimi AS 'firstName',
        sukunimi AS 'lastName',
        rooli AS 'role',
        email, 
        adminStatus
      FROM henkilo
      WHERE id = :id;
          `,
      { id },
    );

    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
