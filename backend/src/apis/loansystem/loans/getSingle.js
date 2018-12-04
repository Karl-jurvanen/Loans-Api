import { loanSystem, loanPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { parseLoanById } from '../../../helpers';
import { getConnection } from '../../../sqlConnection';

export default loanSystem.get(`${loanPath}`, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  console.log('.get id contains:', id);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }
  const conn = await getConnection();
  try {
    // call stored procedure getLoan(:id) that contains query for getting a loan
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
  conn.release();
});
