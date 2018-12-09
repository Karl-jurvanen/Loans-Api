import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { apiPath, login, koaBody } from './constants';
import { checkAccept, checkContent } from '../middleware';
import { getConnection } from '../sqlConnection';

export default login.post(`${apiPath}/login`, checkAccept, checkContent, koaBody, async (ctx) => {
  const { password, email } = ctx.request.body;

  if (typeof password === 'undefined') {
    ctx.throw(400, 'body.password is required');
  } else if (typeof password !== 'string') {
    ctx.throw(400, 'body.done password be string');
  }
  if (typeof email === 'undefined') {
    ctx.throw(400, 'body.email is required');
  } else if (typeof email !== 'string') {
    ctx.throw(400, 'body.email must be string');
  }

  const sha256 = await crypto.createHash('sha256');
  sha256.update(password, 'utf8');
  const passwordDigest = await sha256.digest('base64');
  console.log(passwordDigest);

  const conn = await getConnection();
  try {
    const [data] = await conn.execute(
      `
            SELECT 
                id,
                etunimi AS 'firstName',
                sukunimi AS 'lastName',
                rooli AS 'role',
                adminStatus
            FROM henkilo
            WHERE (email = :email AND salasana = :passwordDigest)
          `,
      { email, passwordDigest },
    );
    // throw 401 if username and password combination is not found
    console.log(data[0]);
    const user = data[0];
    if (typeof user === 'undefined' || user === null) {
      console.log('wrong credentials');

      ctx.throw(401);
    }
    // if user is found, construct a token with user id and admin status embedded in
    const token = await jwt.sign(
      { id: user.id, admin: user.adminStatus ? 'true' : 'false' },
      process.env.JWT_SECRET,
      {
        expiresIn: '30m',
      },
    );
    ctx.status = 200;
    ctx.body = { token };
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();

  console.log('login');
});
