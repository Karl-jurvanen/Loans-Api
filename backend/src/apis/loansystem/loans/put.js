import { checkAccept, checkContent, checkUser } from '../../../middleware';
import { loanSystem, koaBody, loanPath } from '../../constants';
import { getConnection } from '../../../sqlConnection';

// PUT /resource/:id
export default loanSystem.put(loanPath, checkAccept, checkContent, koaBody, async (ctx) => {
  await checkUser(ctx);

  const { id } = ctx.params;
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
  console.log('.post ends contains:', ends);
  console.log('.post timeReturned contains:', timeReturned);

  if (isNaN(id) || id.includes('.')) {
    ctx.throw(400, 'id must be an integer');
  } else if (typeof deviceId === 'undefined') {
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
    // Update the user
    const [status] = await conn.execute(
      `
          UPDATE lainaus SET 
              laite_id = :deviceId,
              lainaaja_id = :loanerId,
              vastuuhenkilo_lainaus_id = :personInChargeLoanId,
              vastuuhenkilo_palautus_id = :personInChargeReturnId,
              kunto_lainaus = :conditionLoan,
              kunto_palautus = :conditionReturn,
              lainausaika = :begins,
              palautusaika = :ends,
              palautettu_aika = :timeReturned
              WHERE id = :id;
              `,
      {
        id,
        deviceId,
        loanerId,
        personInChargeLoanId,
        personInChargeReturnId,
        conditionLoan,
        conditionReturn,
        // mysql does not accept ISO timestring inserted to datetime, so this conversion is needed
        // turn 2018-10-14T11:00:00.000Z"
        // into 2018-10-14 11:00:00.000"
        begins: new Date(begins)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
        ends: new Date(ends)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
        timeReturned: new Date(timeReturned)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
      },
    );

    if (status.affectedRows === 0) {
      // If the resource does not already exist, create it
      await conn.execute(
        `
          insert into lainaus (
              id,
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
              :id,
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
          id,
          deviceId,
          loanerId,
          personInChargeLoanId,
          personInChargeReturnId,
          conditionLoan,
          conditionReturn,
          // mysql does not accept ISO timestring inserted to datetime, so this conversion is needed
          // turn 2018-10-14T11:00:00.000Z"
          // into 2018-10-14 11:00:00.000"
          begins: new Date(begins)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
          ends: new Date(ends)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
          timeReturned: new Date(timeReturned)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
        },
      );
    }
    // Get the user
    const [data] = await conn.execute(
      `
            call getLoan(:id);
              `,
      { id },
    );

    // Return the resource
    ctx.body = data[0];
  } catch (error) {
    console.error('Error occurred:', error);
    ctx.throw(500, error);
  }
  conn.release();
});
