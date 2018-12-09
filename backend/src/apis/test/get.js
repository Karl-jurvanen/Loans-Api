import { test, apiPath } from '../constants';
import { checkAccept } from '../../middleware';

export default test.get(`${apiPath}/test/`, checkAccept, async (ctx) => {
  try {
    // Return all todos
    ctx.body = { greeting: 'Hello World!' };
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
