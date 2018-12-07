// Function that parses flat table from database and creates a nested table
// based on equipment id.

function parseDeviceById(list) {
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

export default parseDeviceById;
