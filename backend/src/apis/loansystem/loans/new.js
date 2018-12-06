import Router from 'koa-router';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, loansPath } from '../../constants';
import { getConnection } from '../../../sqlConnection';

// POST /resource
export default loanSystem.post(
  `${loansPath}/new`,
  checkAccept,
  checkContent,
  koaBody,
  async (ctx) => {
    const {
      deviceId,
      loanerId,
      personInChargeLoanId,
      conditionLoan,
      begins,
      ends,
    } = ctx.request.body;
    console.log('.post deviceId contains:', deviceId);
    console.log('.post loanerId contains:', loanerId);
    console.log('.post personInChargeLoanId contains:', personInChargeLoanId);
    console.log('.post conditionLoan contains:', conditionLoan);
    console.log('.post begins contains:', begins);
    console.log('.post ends contains:', ends);

    if (typeof deviceId === 'undefined') {
      ctx.throw(400, 'body.deviceId is required');
    } else if (isNaN(deviceId) || deviceId.includes('.')) {
      ctx.throw(400, 'body.deviceId must be an integer');
    } else if (typeof loanerId === 'undefined') {
      ctx.throw(400, 'body.loanerId is required');
    } else if (isNaN(loanerId) || loanerId.includes('.')) {
      ctx.throw(400, 'body.loanerId must be an integer');
    } else if (typeof personInChargeLoanId === 'undefined') {
      ctx.throw(400, 'body.personInChargeLoanId is required');
    } else if (isNaN(personInChargeLoanId) || personInChargeLoanId.includes('.')) {
      ctx.throw(400, 'body.personInChargeLoanId must be an integer');
    } else if (typeof conditionLoan === 'undefined') {
      ctx.throw(400, 'body.conditionLoan is required');
    } else if (typeof conditionLoan !== 'string') {
      ctx.throw(400, 'body.conditionLoan must be string');
    } else if (typeof begins === 'undefined') {
      ctx.throw(400, 'body.begins is required');
    } else if (new Date(begins).getDate() <= 0) {
      ctx.throw(400, 'body.begins must be a UTC timestamp');
    } else if (typeof ends === 'undefined') {
      ctx.throw(400, 'body.ends is required');
    } else if (new Date(ends).getDate() <= 0) {
      ctx.throw(400, 'body.ends must be a UTC timestamp');
    }

    const conn = await getConnection();
    try {
      const [status] = await conn.execute(
        `
          call newLoan( 
              :deviceId,
              :personInChargeLoanId,
              :loanerId,
              :conditionLoan,
              :begins,
              :ends
              );
              `,
        {
          deviceId,
          personInChargeLoanId,
          loanerId,
          conditionLoan,
          begins,
          ends,
        },
      );
      // newDevice returns last inserted id in result set
      const { id: insertId } = status[0][0];
      console.log('status', status);
      console.log('insertID', insertId);

      // Get the new device
      const [data] = await conn.execute(
        `
              call getLoan(:id);
            `,
        { id: insertId },
      );

      // Set the response header to 201 Created
      ctx.status = 201;

      // Set the Location header to point to the new resource
      const newUrl = `${ctx.host}${Router.url(loansPath, { id: insertId })}`;
      ctx.set('Location', newUrl);
      ctx.body = data[0];
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
