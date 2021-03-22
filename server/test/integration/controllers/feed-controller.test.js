const { expect } = require('chai');
const mongoose = require('mongoose');

const User = require('../../../src/models/user.model');
const Post = require('../../../src/models/post.model');

const FeedControllers = require('../../../src/controllers/feed.controller');

let user;

describe('Feed Controllers - ', () => {
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
    await Post.deleteMany({});
    await mongoose.disconnect();
  });

  it('should add a created post to the posts of the creator', async () => {
    const req = {
      body: {
        title: 'Test title',
        content: 'Test content',
      },
      file: {
        path: 'abc',
      },
      userId: user._id.toString(),
    };

    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    const creator = await FeedControllers.postPost(req, res, () => {});
    expect(creator).to.have.property('posts');
    expect(creator.posts).to.have.length(1);
  });
});
