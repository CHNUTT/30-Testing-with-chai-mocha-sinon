const jwt = require('jsonwebtoken');
const { SECRET_TOKEN } = require('../utils/config');
const { createError } = require('../utils/helper');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) throw createError('Not Authorized', 401);

    const token = req.get('Authorization').split(' ')[1];
    const decodedToken = jwt.verify(token, SECRET_TOKEN);
    if (!decodedToken) throw createError('Not Authorized', 401);

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
};
