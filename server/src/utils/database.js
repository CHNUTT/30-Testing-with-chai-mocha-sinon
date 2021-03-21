const mongoose = require('mongoose');
const { connect } = require('../routes/feed.routes');
const { MONGO_URI } = require('../utils/config');

let connection;

const mongoConnect = async () => {
  try {
    connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    if (!connection) throw new Error('Cannot connect to MongoDB');

    console.log('Successfully connect to the DB');
    return connection;
  } catch (err) {
    console.log(err);
    throw new Error();
  }
};

const getConnection = () => {
  if (!connection) throw new Error('Cannot connect to MongoDB');
  return connection;
};

module.exports = { mongoConnect, getConnection };
