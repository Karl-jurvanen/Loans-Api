import mysql from 'mysql2/promise';
import { connectionSettings } from './settings';

const pool = mysql.createPool(connectionSettings);
export const getConnection = () => pool.getConnection();
