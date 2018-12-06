export const connectionSettings = {
  host: 'db',
  user: 'root',
  database: 'db_1',
  password: process.env.MYSQL_ROOT_PASSWORD,
  namedPlaceholders: true,
  dateStrings: true,
};
