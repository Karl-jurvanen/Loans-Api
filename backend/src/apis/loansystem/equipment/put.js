import mysql from 'mysql2/promise';
import { connectionSettings } from '../../../settings';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, equipmentPath } from '../../constants';

// PUT /resource/:id
export default loanSystem.put(equipmentPath, checkAccept, checkContent, koaBody, async (ctx) => {
  const { id } = ctx.params;
  const { code, name, info } = ctx.request.body;
  console.log('.post code contains:', code);
  console.log('.post deviceName contains:', name);
  console.log('.post deviceInfo contains:', info);
  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  } else if (typeof code === 'undefined') {
    ctx.throw(400, 'body.code is required');
  } else if (typeof code !== 'string') {
    ctx.throw(400, 'body.code must be string');
  } else if (typeof name === 'undefined') {
    ctx.throw(400, 'body.name is required');
  } else if (typeof code !== 'string') {
    ctx.throw(400, 'body.name must be string');
  } else if (typeof info === 'undefined') {
    ctx.throw(400, 'body.info is required');
  } else if (typeof info !== 'string') {
    ctx.throw(400, 'body.info must be string');
  }

  try {
    const conn = await mysql.createConnection(connectionSettings);

    // Update the user
    const [status] = await conn.execute(
      `
            UPDATE laite
            SET koodi = :code, nimi = :name, tiedot = :info
            WHERE id = :id;
        `,
      {
        code,
        name,
        info,
        id,
      },
    );

    if (status.affectedRows === 0) {
      // If the resource does not already exist, create it
      await conn.execute(
        `
        INSERT INTO laite(id, koodi, nimi, tiedot)
        VALUES(:id, :code, :name, :info);
            `,
        {
          code,
          name,
          info,
        },
      );
    }
    const { insertId } = status;
    // Get the user
    const [data] = await conn.execute(
      `
                call getDevice(:id);
              `,
      { id: insertId },
    );

    // Return the resource
    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
