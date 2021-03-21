const { expect } = require('chai');

const authMiddleware = require('../src/middlewares/is-auth');

it('should throw an error if no authorization header passing in', () => {
  const req = {
    get: function (headerName) {
      return null;
    },
  };

  expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not Authorized');
});
