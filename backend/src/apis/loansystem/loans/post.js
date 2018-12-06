import Router from 'koa-router';
import { checkAccept, checkContent } from '../../../middleware';
import { loanSystem, koaBody, loansPath } from '../../constants';
import { getConnection } from '../../../sqlConnection';

// POST /resource
export default loanSystem.post(loansPath, checkAccept, checkContent, koaBody, async (ctx) => {
  // const { text } = ctx.request.body;
  const {
    deviceId,
    loanerId,
    personInChargeLoanId,
    personInChargeReturnId,
    conditionLoan,
    conditionReturn,
    begins,
    ends,
    timeReturned,
  } = ctx.request.body;
  console.log('.post deviceId contains:', deviceId);
  console.log('.post loanerId contains:', loanerId);
  console.log('.post personInChargeLoanId contains:', personInChargeLoanId);
  console.log('.post personInChargeReturnId contains:', personInChargeReturnId);
  console.log('.post conditionLoan contains:', conditionLoan);
  console.log('.post conditionReturn contains:', conditionReturn);
  console.log('.post begins contains:', begins);
  console.log('.post begins contains:', new Date(begins).toUTCString());

  console.log('.post ends contains:', ends);
  console.log('.post timeReturned contains:', timeReturned);

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
  } else if (typeof personInChargeReturnId === 'undefined') {
    ctx.throw(400, 'body.personInChargeReturnId is required');
  } else if (isNaN(personInChargeReturnId) || personInChargeReturnId.includes('.')) {
    ctx.throw(400, 'body.personInChargeReturnId must be an integer');
  } else if (typeof conditionLoan === 'undefined') {
    ctx.throw(400, 'body.conditionLoan is required');
  } else if (typeof conditionLoan !== 'string') {
    ctx.throw(400, 'body.conditionLoan must be string');
  } else if (typeof conditionReturn === 'undefined') {
    ctx.throw(400, 'body.conditionReturn is required');
  } else if (typeof conditionReturn !== 'string') {
    ctx.throw(400, 'body.conditionReturn must be string');
  } else if (typeof begins === 'undefined') {
    ctx.throw(400, 'body.begins is required');
  } else if (new Date(begins).getDate() <= 0) {
    ctx.throw(400, 'body.begins must be a UTC timestamp');
  } else if (typeof ends === 'undefined') {
    ctx.throw(400, 'body.ends is required');
  } else if (new Date(ends).getDate() <= 0) {
    ctx.throw(400, 'body.ends must be a UTC timestamp');
  } else if (typeof timeReturned === 'undefined') {
    ctx.throw(400, 'body.timeReturned is required');
  } else if (new Date(timeReturned).getDate() <= 0) {
    ctx.throw(400, 'body.timeReturned must be a UTC timestamp');
  }

  const conn = await getConnection();
  try {
    const [status] = await conn.execute(
      `
        insert into lainaus (
            laite_id, 
            lainaaja_id,
            vastuuhenkilo_lainaus_id,
            vastuuhenkilo_palautus_id,
            kunto_lainaus,
            kunto_palautus,
            lainausaika,
            palautusaika,
            palautettu_aika
            )

        values ( 
            :deviceId,
            :loanerId,
            :personInChargeLoanId,
            :personInChargeReturnId,
            :conditionLoan,
            :conditionReturn,
            :begins,
            :ends,
            :timeReturned
            );
            `,
      {
        deviceId,
        loanerId,
        personInChargeLoanId,
        personInChargeReturnId,
        conditionLoan,
        conditionReturn,
        begins,
        ends,
        timeReturned,
      },
    );
    // newDevice returns last inserted id in result set
    const { insertId } = status;

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
      ctx.throw(400, 'Person in charge of device must first exist in people');
    } else {
      console.error('Error occurred:', error);
      console.error('ERROR NUMBER', error.errno);
      ctx.throw(500, error);
    }
  }
  conn.release();
});
