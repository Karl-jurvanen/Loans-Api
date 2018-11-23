import mysql from 'mysql2/promise';
import Url from 'url';
import { connectionSettings } from '../../../settings';
import { loanSystem, equipmentsPath } from '../../constants';
import { checkAccept } from '../../../middleware';
import { parseSortQuery } from '../../../helpers';

function nestDeviceById(list) {
  return list.reduce((acc, item) => {
    const { id } = item;
    const index = acc.findIndex(x => x.id === id);
    if (index === -1) {
      acc.push({
        id: item.id,
        name: item.name,
        info: item.info,
        personInCharge: [
          {
            id: item.personInChargeId,
            firstName: item.personInChargeFirstName,
            lastName: item.personInChargeLastName,
          },
        ],
      });
    } else {
      acc[index].personInCharge.push({
        id: item.personInChargeId,
        firstName: item.personInChargeFirstName,
        lastName: item.personInChargeLastName,
      });
    }
    return acc;
  }, []);
}

export default loanSystem.get(`${equipmentsPath}`, checkAccept, async (ctx) => {
  const url = Url.parse(ctx.url, true);
  const { sort } = url.query;

  const orderBy = parseSortQuery({
    urlSortQuery: sort,
    whitelist: ['id', 'code', 'name', 'info', 'person_in_charge'],
  });

  try {
    // first call getDevices stored procedure that stores data we need into temporary table called
    // temp. Second query is to order the table based on orderBy.

    const conn = await mysql.createConnection(connectionSettings);
    await conn.execute(`
              call getDevices();
            `);

    const [data] = await conn.execute(`
            SELECT * 
            FROM temp
            ${orderBy};
          `);

    // Return all todos
    ctx.body = nestDeviceById(data);
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
