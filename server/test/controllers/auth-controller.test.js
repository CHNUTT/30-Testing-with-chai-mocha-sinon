const { expect } = require('chai');
const sinon = require('sinon');

const mongoose = require('mongoose')
const User = require('../../src/models/user.model');
const AuthController = require('../../src/controllers/auth.controller');


describe('Auth Controller - Login', () => {
  afterEach(()=>{
    delete mongoose.connection.models['User'];
    // mongoose.connection.deleteModel(/.+/);
  })
  it('should throw an error with code 500 if accessing the database fails', (done) => {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: '123456',
      },
    };

    AuthController.signin(req, {}, () => {}).then((result) => {
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });

    User.findOne.restore();
  });
});
