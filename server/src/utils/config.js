require('dotenv').config();
const {
  DB_HOST_NAME = 'mongo',
  DB_DATABASE_NAME = 'messages',
  DB_HOST_PORT = '27017',
  DB_USER = 'root',
  DB_PASSWORD = 'password',
  DB_AUTH = 'admin',
  SECRET_TOKEN,
} = process.env;

const MONGO_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST_NAME}:${DB_HOST_PORT}/${DB_DATABASE_NAME}?authSource=${DB_AUTH}`;

module.exports = {
  MONGO_URI,
  SECRET_TOKEN,
};
