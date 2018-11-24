import mysql from 'mysql2/promise';
import Router from 'koa-router';
import { connectionSettings } from '../../../settings';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, equipmentsPath } from '../../constants';
import { parseEquipmentById } from '../../../helpers';

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

  try {
    const conn = await mysql.createConnection(connectionSettings);

    // Insert a new device

    // TODO - Fix
    // TODO make these two inserts into a transaction

    // call newDevice(:code, :name, :info, :adminId);

    //       INSERT INTO laite (koodi, nimi, tiedot)
    //       VALUES ("123", "mac", "kone");
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
    const { insertId } = status[0][0];
    console.log(status);
    console.log(status[0]);
    console.log(insertId);
    // Get the new todo
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
    if (error.errno === 1452) {
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(400, 'Person in charge of device must first exist in people');
    } else {
      console.error('Error occurred:', error);
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(500, error);
    }
  }
});
