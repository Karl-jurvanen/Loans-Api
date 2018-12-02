// Function that parses flat table from database and creates a nested table
// based on loan id.

function parseLoanById(list) {
  return list.reduce((acc, item) => {
    const { id } = item;
    const index = acc.findIndex(x => x.id === id);
    if (index === -1) {
      acc.push({
        id: item.id,
        deviceId: item.device_id,
        code: item.code,
        name: item.name,
        info: item.info,
        begins: item.begins,
        ends: item.ends,
        returned: item.returned,
        conditionLoaned: item.conditionLoaned,
        conditionReturned: item.conditionReturned,
        loaner: {
          id: item.loanerId,
          firstName: item.loanerFirstName,
          lastName: item.loanerLastName,
        },

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

export default parseLoanById;
