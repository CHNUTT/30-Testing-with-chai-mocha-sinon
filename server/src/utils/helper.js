const fs = require('fs');
const { join } = require('path');
const rootDir = require('./path');

exports.createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

exports.removeImage = (imagePath) => {
  const filePath = join(rootDir, 'public', imagePath);
  fs.unlink(filePath, (err) => console.log(err));
};
