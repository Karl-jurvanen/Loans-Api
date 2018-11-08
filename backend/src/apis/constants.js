import Router from 'koa-router';
import KoaBody from 'koa-bodyparser';

export const test = new Router();
export const todos = new Router();
export const koaBody = new KoaBody();
// Define API path
export const apiPath = '/api/v1';

// Define todos paths
export const todosPath = `${apiPath}/todos`;
export const todoPath = `${todosPath}/:id`;
