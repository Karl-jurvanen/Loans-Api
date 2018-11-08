import mysql from 'mysql2/promise';
import Router from 'koa-router';
import { connectionSettings } from '../settings';
import {
  todos, apiPath, todosPath, todoPath,
} from './constants';

import test from './test';

export { test };
