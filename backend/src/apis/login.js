import jwt from 'jsonwebtoken';
import { apiPath, login, koaBody } from './constants';
import { checkAccept, checkContent } from '../middleware';

export default login.post(`${apiPath}/login`, checkAccept, checkContent, koaBody, async (ctx) => {
  const { password } = ctx.request.body;

  if (password === 'admin') {
    const token = await jwt.sign({ id: '2', admin: true }, 'verisecret', { expiresIn: '30m' });
    ctx.status = 200;
    ctx.body = { token };
    console.log('ok');
  } else if (password === 'user') {
    const token = await jwt.sign({ id: '2', admin: false }, 'verisecret', { expiresIn: '30m' });
    ctx.status = 200;
    ctx.body = { token };
  } else {
    ctx.status = 401;
  }
});
