export const cors = async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Access, Authorization',
  );
  ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

  await next();
};
