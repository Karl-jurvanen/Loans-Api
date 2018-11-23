import mysql from 'mysql2/promise';
import Url from 'url';
import { connectionSettings } from '../../../../settings';
import { loanSystem, equipmentAdminsPath } from '../../../constants';
import { checkAccept } from '../../../../middleware';
import { parseSortQuery } from '../../../../helpers';

export default loanSystem.get(`${equipmentAdminsPath}`, checkAccept, async (ctx) => {
  const { id } = ctx.params;
  const url = Url.parse(ctx.url, true);
  const { sort } = url.query;

  const orderBy = parseSortQuery({
    urlSortQuery: sort,
    whitelist: ['id', 'code', 'name', 'info', 'person_in_charge'],
  });
  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  }
  try {
    const conn = await mysql.createConnection(connectionSettings);

    const [data] = await conn.execute(
      `
 
    SELECT 
        henkilo.id,
        henkilo.etunimi AS 'firstName',
        henkilo.sukunimi AS 'lastName'
    FROM
        laite,
        vastuuhenkilo,
        henkilo
    WHERE
        laite.id = vastuuhenkilo.laite_id
        AND henkilo.id = vastuuhenkilo.henkilo_id
        AND laite.id = :id;
            `,
      { id },
    );

    // if sql query returns values, return the sql result,
    // else set body to null so a 204 is sent
    if (data.length > 0) {
      ctx.body = data;
    } else {
      ctx.body = null;
    }
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
});
