import JWT from 'jsonwebtoken';

// Middleware for checking request body jwt token user type and id
// An admin user can access all endpoints regardless of id,
// an end user can only access endpoints that are specific to that user

// if id parameter is not passes, only admin is allowed

export const getUserId = async (ctx) => {
  console.log('getUserId');

  const { authorization } = ctx.header;
  const token = authorization.split(' ')[1];
  const decoded = JWT.decode(token);

  if (decoded.admin === 'true') {
    return -1;
  }
  return decoded.id;

  // Move to next middleware
};
