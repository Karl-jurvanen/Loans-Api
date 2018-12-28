import Router from 'koa-router';
import crypto from 'crypto';
import { checkAccept, checkContent, checkUser } from '../../../middleware';
import { getConnection } from '../../../sqlConnection';
import {
  loanSystem, koaBody, usersPath, userPath,
} from '../../constants';

// POST /resource
export default loanSystem.post(usersPath, checkAccept, checkContent, koaBody, async (ctx) => {
  const {
    firstName, lastName, role, email, password, adminStatus,
  } = ctx.request.body;
  console.log('.post firstName contains:', firstName);
  console.log('.post lastName contains:', lastName);
  console.log('.post role contains:', role);
  console.log('.post email contains:', email);
  console.log('.post password contains:', password);
  console.log('.post adminStatus contains:', adminStatus);
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
  } else if (typeof email === 'undefined') {
    ctx.throw(400, 'body.email is required');
  } else if (typeof email !== 'string') {
    ctx.throw(400, 'body.email must be string');
  } else if (typeof password === 'undefined') {
    ctx.throw(400, 'body.password is required');
  } else if (typeof password !== 'string') {
    ctx.throw(400, 'body.password must be string');
  } else if (typeof adminStatus === 'undefined') {
    ctx.throw(400, 'body.adminStatus is required');
  } else if (typeof adminStatus !== 'boolean') {
    ctx.throw(400, 'body.adminStatus must be boolean');
  }
  await checkUser(ctx);
  const sha256 = await crypto.createHash('sha256');
  sha256.update(password, 'utf8');
  const passwordDigest = await sha256.digest('base64');
  const conn = await getConnection();
  try {
    const [status] = await conn.execute(
      `
        INSERT INTO henkilo(etunimi, sukunimi, rooli, email, salasana, adminStatus)
        VALUES(:firstName, :lastName, :role, :email, :passwordDigest, :adminStatus);
    
      `,
      {
        firstName,
        lastName,
        role,
        email,
        passwordDigest,
        adminStatus,
      },
    );

    const { insertId } = status;

    // Get the new user
    // don't give password hash
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
      { id: insertId },
    );

    // Set the response header to 201 Created
    ctx.status = 201;

    // Set the Location header to point to the new resource
    const newUrl = `${ctx.host}${Router.url(userPath, { id: insertId })}`;
    ctx.set('Location', newUrl);

    ctx.body = data[0];
  } catch (error) {
    if (error.errno === 1062) {
      ctx.throw(409, 'email already exists');
    }
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
