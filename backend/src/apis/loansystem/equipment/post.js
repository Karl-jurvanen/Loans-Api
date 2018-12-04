import Router from 'koa-router';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, equipmentsPath } from '../../constants';
import { parseEquipmentById } from '../../../helpers';
import { getConnection } from '../../../sqlConnection';

// POST /resource
export default loanSystem.post(equipmentsPath, checkAccept, checkContent, koaBody, async (ctx) => {
  // const { text } = ctx.request.body;
  const {
    code, name, info, adminId,
  } = ctx.request.body;
  console.log('.post code contains:', code);
  console.log('.post deviceName contains:', name);
  console.log('.post deviceInfo contains:', info);
  console.log('.post adminId contains:', adminId);
  if (typeof code === 'undefined') {
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
  } else if (typeof adminId === 'undefined') {
    ctx.throw(400, 'body.adminId is required');
  } else if (isNaN(adminId) || adminId.includes('.')) {
    ctx.throw(400, 'adminId must be an integer');
  }

  const conn = await getConnection();
  try {
    const [status] = await conn.execute(
      `
      call newDevice(:code, :name, :info, :adminId);
            `,
      {
        code,
        name,
        info,
        adminId,
      },
    );

    // newDevice returns last inserted id in result set
    const { insertId } = status[0][0];

    // Get the new device
    const [data] = await conn.execute(
      `
              call getDevice(:id);
            `,
      { id: insertId },
    );

    // Set the response header to 201 Created
    ctx.status = 201;

    // Set the Location header to point to the new resource
    const newUrl = `${ctx.host}${Router.url(equipmentsPath, { id: insertId })}`;
    ctx.set('Location', newUrl);

    ctx.body = parseEquipmentById(data[0])[0];
  } catch (error) {
    // Error 1452 is mySQL error for foreign key violation,
    // meaning that person id given does not exist
    // Throw with a specific message
    if (error.errno === 1452) {
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(400, 'Person in charge of device must first exist in people');
    } else {
      console.error('Error occurred:', error);
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(500, error);
    }
  }
  conn.release();
});
