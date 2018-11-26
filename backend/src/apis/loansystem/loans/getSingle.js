import mysql from 'mysql2/promise';
import { connectionSettings } from '../../../settings';
import { loanSystem, loanPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { parseLoanById } from '../../../helpers';

export default loanSystem.get(`${loanPath}`, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  console.log('.get id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }
  try {
    const conn = await mysql.createConnection(connectionSettings);
    // call stored procedure GetDevice that contains query
    const [data] = await conn.execute(
      `
        call getLoan(:id);
          `,
      { id },
    );

    // parseEquipmentById returns an object in an array, so here we take first element of the array
    // to just get the object
    ctx.body = parseLoanById(data[0])[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
