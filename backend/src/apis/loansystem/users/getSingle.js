import mysql from 'mysql2/promise';
import { connectionSettings } from '../../../settings';
import { loanSystem, userPath } from '../../constants';
import { checkAccept } from '../../../middleware';

export default loanSystem.get(`${userPath}`, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  console.log('.get id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }
  try {
    const conn = await mysql.createConnection(connectionSettings);
    const [data] = await conn.execute(
      `
        SELECT 
            id,
            etunimi AS 'firstName',
            sukunimi AS 'lastName',
            rooli AS 'role'
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
});
