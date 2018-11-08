import Router from 'koa-router';

export const test = new Router();
export const todos = new Router();

// Define API path
export const apiPath = '/api/v1';

// Define todos paths
export const todosPath = `${apiPath}/todos`;
export const todoPath = `${todosPath}/:id`;
