import mysql from 'mysql2/promise';
import Router from 'koa-router';
import { connectionSettings } from '../../../../settings';
import {
  loanSystem, koaBody, equipmentAdminsPath, equipmentAdminPath,
} from '../../../constants';
import { checkAccept, checkContent } from '../../../../middleware';

// POST /resource
export default loanSystem.post(
  equipmentAdminsPath,
  checkAccept,
  checkContent,
  koaBody,
  async (ctx) => {
    const { id } = ctx.params;
    const { userId } = ctx.request.body;
    console.log('.post equipmentId contains:', id);
    console.log('.post userId contains:', userId);
    if (isNaN(id) || id.includes('.')) {
      ctx.throw(400, 'id must be an integer');
    } else if (typeof userId === 'undefined') {
      ctx.throw(400, 'body.userId is required');
    } else if (isNaN(userId) || userId.includes('.')) {
      ctx.throw(400, 'userId must be an integer');
    }

    try {
      const conn = await mysql.createConnection(connectionSettings);

      await conn.execute(
        `
        INSERT INTO vastuuhenkilo(laite_id, henkilo_id)
        VALUES(:equipmentId, :userId);
              `,
        { equipmentId: id, userId },
      );

      // Get the new person
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
          AND henkilo.id = :userId
          AND laite.id = :equipmentId;
              `,
        { equipmentId: id, userId },
      );

      // Set the response header to 201 Created
      ctx.status = 201;

      // Set the Location header to point to the new resource
      const newUrl = `${ctx.host}${Router.url(equipmentAdminPath, { id, adminId: userId })}`;
      ctx.set('Location', newUrl);

      ctx.body = data[0];
    } catch (error) {
      // Error 1452 is mySQL error for foreign key violation,
      // meaning that person id given does not exist
      // Throw with a specific message
      if (error.errno === 1452) {
        console.error('ERROR NUMBER', error.errno);
        ctx.throw(400, 'Person in charge of device and the device must first exist');
      } else if (error.errno === 1062) {
        console.error('ERROR NUMBER', error.errno);
        ctx.throw(400, 'Entry already exists');
      } else {
        console.error('Error occurred:', error);
        console.error('ERROR NUMBER', error.errno);
        ctx.throw(500, error);
      }
    }
  },
);
