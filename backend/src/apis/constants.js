import Router from 'koa-router';
import KoaBody from 'koa-bodyparser';

export const test = new Router();
export const todos = new Router();
export const loanSystem = new Router();
export const koaBody = new KoaBody();
// Define API path
export const apiPath = '/api/v1';

// Define todos paths
export const todosPath = `${apiPath}/todos`;
export const todoPath = `${todosPath}/:id`;

export const usersPath = `${apiPath}/users`;
export const userPath = `${usersPath}/:id`;

export const equipmentsPath = `${apiPath}/equipment`;
export const equipmentPath = `${equipmentsPath}/:id`;

export const loansPath = `${apiPath}/loans`;
export const loanPath = `${loansPath}/:id`;
