const express = require('express');
const feedController = require('../controllers/feed.controller');
const { body } = require('express-validator');
const isAuth = require('../middlewares/is-auth');

const route = express.Router();

// GET /feed/posts
route.get('/posts', isAuth, feedController.getPosts);

// GET /feed/post/:postId
route.get('/post/:postId', isAuth, feedController.getPost);

// POST /feed/post
route.post(
  '/post',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedController.postPost
);

// PUT /feed/post
route.put(
  '/post/:postId',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

// DELETE /feed/post/:postId
route.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = route;
