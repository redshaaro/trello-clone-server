require('dotenv').config();

const sharedConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || 'postgres',
 dialectModule: require('pg'),
  logging:false
};

module.exports = {
  development: sharedConfig,
  test: sharedConfig,
  production: sharedConfig
};
