const { expect } = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');

const User = require('../../../src/models/user.model');
const AuthControllers = require('../../../src/controllers/auth.controller');

describe('Integration - Auth Controller - getUserStatus', () => {
  afterEach(() => {
    delete mongoose.connection.models[('User', 'Post')];
    // mongoose.connection.deleteModel(/.+/);
  });
  it('should send a response with a valid user status for an existing user', (done) => {
    require('../../../src/utils/database')
      .mongoConnect()
      .then((_) => {
        const newUser = new User({
          email: 'test@test.com',
          password: 'tester',
          name: 'Test',
          posts: [],
        });
        return newUser.save();
      })
      .then((user) => {
        const req = { userId: user._id.toString() };
        const res = {
          statusCode: 500,
          userStatus: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.userStatus = data.status;
          },
        };
        AuthControllers.getUserStatus(req, res, () => {}).then((_) => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userStatus).to.be.equal('I am new!');
          User.deleteMany({})
            .then(() => {
              return mongoose.disconnect();
            })
            .then(() => {
              done();
            });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });
});
