import Router from 'koa-router';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, loanPath } from '../../constants';
import { getConnection } from '../../../sqlConnection';

// POST /resource
export default loanSystem.post(
  `${loanPath}/return`,
  checkAccept,
  checkContent,
  koaBody,
  async (ctx) => {
    const { id } = ctx.params;
    const { personInChargeReturnId, conditionReturn, timeReturned } = ctx.request.body;
    console.log('.post personInChargeReturnId contains:', personInChargeReturnId);
    console.log('.post id contains:', id);
    console.log('.post conditionReturn contains:', conditionReturn);
    console.log('.post timeReturned contains:', timeReturned);

    if (typeof id === 'undefined') {
      ctx.throw(400, 'body.deviceId is required');
    } else if (isNaN(id) || id.includes('.')) {
      ctx.throw(400, 'body.deviceId must be an integer');
    } else if (typeof personInChargeReturnId === 'undefined') {
      ctx.throw(400, 'body.personInChargeReturnId is required');
    } else if (isNaN(personInChargeReturnId) || personInChargeReturnId.includes('.')) {
      ctx.throw(400, 'body.personInChargeReturnId must be an integer');
    } else if (typeof conditionReturn === 'undefined') {
      ctx.throw(400, 'body.conditionReturn is required');
    } else if (typeof conditionReturn !== 'string') {
      ctx.throw(400, 'body.conditionReturn must be string');
    } else if (typeof timeReturned === 'undefined') {
      ctx.throw(400, 'body.timeReturned is required');
    } else if (new Date(timeReturned).getDate() <= 0) {
      ctx.throw(400, 'body.timeReturned must be a UTC timestamp');
    }

    const conn = await getConnection();

    try {
      const [status] = await conn.execute(
        `
            call returnLoan(:id, :personInChargeReturnId, :conditionReturn, :timeReturned );
                `,
        {
          id,
          personInChargeReturnId,
          conditionReturn,
          // mysql does not accept ISO timestring inserted to datetime, so this conversion is needed
          // turn 2018-10-14T11:00:00.000Z"
          // into 2018-10-14 11:00:00.000"
          timeReturned: new Date(timeReturned)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
        },
      );
      console.log(status[0][0]);
      const { insertId } = status;

      if (insertId <= 0) {
        ctx.throw(400, 'unknown');
      }

      // newLoan returns last inserted id in result set
      // const { id: insertId } = status[0][0];
      console.log('status', status);
      // console.log('insertID', insertId);

      // Get the new device
      const [data] = await conn.execute(
        `
              call getLoan(:id);
            `,
        { id },
      );

      // Set the response header to 201 Created
      ctx.status = 201;

      // Set the Location header to point to the new resource
      const newUrl = `${ctx.host}${Router.url(loanPath, { id })}`;
      ctx.set('Location', newUrl);
      ctx.body = data[0][0];
    } catch (error) {
      // Error 1452 is mySQL error for foreign key violation,
      // meaning that person id given does not exist
      // Throw with a specific message
      if (error.errno === 1452) {
        console.error('ERROR NUMBER', error.errno);
        ctx.throw(400, 'Loaner and Person in charge of device must first exist in people');
      } else if (error.errno === 1644) {
        console.error('ERROR NUMBER', error.errno);
        ctx.throw(400, 'Person in charge of loan must be a person in charge of the device');
      } else if (error.errno === 1645) {
        console.error('ERROR NUMBER', error.errno);
        ctx.throw(400, 'Device not available');
      } else {
        console.error('Error occurred:', error);
        console.error('ERROR NUMBER', error.errno);
        ctx.throw(500, error);
      }
    }
    conn.release();
  },
);
