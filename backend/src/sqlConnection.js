import mysql from 'mysql2/promise';
import { connectionSettings } from './settings';

export const pool = mysql.createPool(connectionSettings);
export const getConnection = () => pool.getConnection();

/*
The connection times out after a few hours of no connections,
and after that trying to connect to pool results in an error.
his function is to try to solve that by pinging it once every 30 minutes.
*/
async function keepAlive() {
  const conn = await getConnection();
  conn.ping();
  conn.release();
}

setInterval(keepAlive, 1000 * 60 * 30);
