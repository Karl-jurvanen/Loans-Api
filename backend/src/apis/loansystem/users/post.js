import mysql from 'mysql2/promise';
import Router from 'koa-router';
import { connectionSettings } from '../../../settings';
import { checkAccept, checkContent } from '../../../middleware';
import {
  loanSystem, koaBody, usersPath, userPath,
} from '../../constants';

// POST /resource
export default loanSystem.post(usersPath, checkAccept, checkContent, koaBody, async (ctx) => {
  const { firstName, lastName, role } = ctx.request.body;
  console.log('.post firstName contains:', firstName);
  console.log('.post lastName contains:', lastName);
  console.log('.post role contains:', role);
  if (typeof firstName === 'undefined') {
    ctx.throw(400, 'body.firstName is required');
  } else if (typeof firstName !== 'string') {
    ctx.throw(400, 'body.firstName must be string');
  } else if (typeof lastName === 'undefined') {
    ctx.throw(400, 'body.lastName is required');
  } else if (typeof firstName !== 'string') {
    ctx.throw(400, 'body.lastName must be string');
  } else if (typeof role === 'undefined') {
    ctx.throw(400, 'body.role is required');
  } else if (typeof role !== 'string') {
    ctx.throw(400, 'body.role must be string');
  }

  try {
    const conn = await mysql.createConnection(connectionSettings);

    const [status] = await conn.execute(
      `
        INSERT INTO henkilo(etunimi, sukunimi, rooli)
        VALUES(:firstName, :lastName, :role);
    
      `,
      {
        firstName,
        lastName,
        role,
      },
    );

    const { insertId } = status;

    // Get the new user
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
      { id: insertId },
    );

    // Set the response header to 201 Created
    ctx.status = 201;

    // Set the Location header to point to the new resource
    const newUrl = `${ctx.host}${Router.url(userPath, { id: insertId })}`;
    ctx.set('Location', newUrl);

    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
