import mysql from 'mysql2/promise';
import Router from 'koa-router';
import { connectionSettings } from '../../../settings';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, equipmentsPath } from '../../constants';

// POST /resource
export default loanSystem.post(equipmentsPath, checkAccept, checkContent, koaBody, async (ctx) => {
  // const { text } = ctx.request.body;
  const { code } = ctx.request.body;
  const { deviceTypeId } = ctx.request.body;
  console.log('.post code contains:', code);
  console.log('.post devicetype contains:', deviceTypeId);
  if (typeof code === 'undefined') {
    ctx.throw(400, 'body.code is required');
  } else if (typeof code !== 'string') {
    ctx.throw(400, 'body.code must be string');
  } else if (typeof deviceTypeId === 'undefined') {
    ctx.throw(400, 'body.deviceTypeId is required');
  } else if (isNaN(deviceTypeId)) {
    ctx.throw(400, 'body.deviceTypeId must be integer');
  }

  try {
    const conn = await mysql.createConnection(connectionSettings);

    // Insert a new todo
    const [status] = await conn.execute(
      `
              INSERT INTO laite (laitetyyppi_id, koodi)
              VALUES (:deviceTypeId, :code);
            `,
      { deviceTypeId, code },
    );
    const { insertId } = status;

    // Get the new todo
    const [data] = await conn.execute(
      `
              call getDevice(:id)
            `,
      { id: insertId },
    );

    // Set the response header to 201 Created
    ctx.status = 201;

    // Set the Location header to point to the new resource
    const newUrl = `${ctx.host}${Router.url(equipmentsPath, { id: insertId })}`;
    ctx.set('Location', newUrl);

    // Return the new todo
    ctx.body = data;
  } catch (error) {
    if (error.errno === 1452) {
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(400, 'device type must exist in device types');
    } else {
      console.error('Error occurred:', error);
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(500, error);
    }
  }
});
