const { expect } = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');

const User = require('../../../src/models/user.model');
const AuthControllers = require('../../../src/controllers/auth.controller');
let user;
describe('Integration - Auth Controller - getUserStatus', () => {
  before(async () => {
    await require('../../../src/utils/database').mongoConnect();
    const newUser = new User({
      email: 'test@test.com',
      password: 'tester',
      name: 'Test',
      posts: [],
    });
    user = await newUser.save();
  });
  afterEach(() => {
    delete mongoose.connection.models[('User', 'Post')];
    // mongoose.connection.deleteModel(/.+/);
  });
  after(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
  it('should send a response with a valid user status for an existing user', async () => {
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
    await AuthControllers.getUserStatus(req, res, () => {});
    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.be.equal('I am new!');
  });
});
