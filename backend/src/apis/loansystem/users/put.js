import { getConnection } from '../../../sqlConnection';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, userPath } from '../../constants';

// PUT /resource/:id
export default loanSystem.put(userPath, checkAccept, checkContent, koaBody, async (ctx) => {
  const { id } = ctx.params;
  const { firstName, lastName, role } = ctx.request.body;
  console.log('.put id contains:', id);
  console.log('.put firstName contains:', firstName);
  console.log('.put lastName contains:', lastName);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  } else if (typeof firstName === 'undefined') {
    ctx.throw(400, 'body.firstName is required');
  } else if (typeof firstName !== 'string') {
    ctx.throw(400, 'body.firstName must be string');
  } else if (typeof lastName === 'undefined') {
    ctx.throw(400, 'body.lastName is required');
  } else if (typeof lastName !== 'string') {
    ctx.throw(400, 'body.lastName must be string');
  } else if (typeof role === 'undefined') {
    ctx.throw(400, 'body.role is required');
  } else if (typeof role !== 'string') {
    ctx.throw(400, 'body.role must be string');
  }
  const conn = await getConnection();
  try {
    // Update the user
    const [status] = await conn.execute(
      `
            UPDATE henkilo
            SET etunimi = :firstName, sukunimi = :lastName, rooli = :role
            WHERE id = :id;
        `,
      {
        id,
        firstName,
        lastName,
        role,
      },
    );

    if (status.affectedRows === 0) {
      // If the resource does not already exist, create it
      await conn.execute(
        `
        INSERT INTO henkilo(id, etunimi, sukunimi, rooli)
        VALUES(:id, :firstName, :lastName, :role);
            `,
        {
          id,
          firstName,
          lastName,
          role,
        },
      );
    }

    // Get the user
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

    // Return the resource
    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
