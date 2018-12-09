import JWT from 'jsonwebtoken';

// Middleware for checking request body jwt token user type and id
// An admin user can access all endpoints regardless of id,
// an end user can only access endpoints that are specific to that user

// if id parameter is not passes, only admin is allowed

export const checkUser = async (ctx, id = null) => {
  console.log('checkUser');

  const { authorization } = ctx.header;
  const token = authorization.split(' ')[1];
  const decoded = JWT.decode(token);

  console.log('id: ', decoded.id);
  console.log('admin: ', decoded.admin);
  if (id !== null) {
    if (decoded.id.toString() === id.toString()) {
      return 1;
    }
  }
  if (decoded.admin === 'true') {
    return 1;
  }
  console.log('wrong user');
  console.log(decoded);
  ctx.throw(401);
  return 0;

  // Move to next middleware
};
