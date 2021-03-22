const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../src/middlewares/is-auth');

describe('isAuth middleware', () => {
  it('should throw an error if no authorization header passing in', () => {
    const req = {
      get: function (headerName) {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      'Not Authorized'
    );
  });

  it('should throw an error if the Authrorization header is only one string', () => {
    const req = {
      get: function (headerName) {
        return 'token';
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should throw an error if token cannot be verify', () => {
    const req = {
      get: function (headerName) {
        return 'Bearer token';
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield a userId after decoding token', () => {
    const req = {
      get: function (headerName) {
        return 'Bearer token';
      },
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'id' });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'id');
    jwt.verify.restore();
  });
});
