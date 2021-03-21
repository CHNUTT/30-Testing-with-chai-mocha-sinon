const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user.model');
const authController = require('../controllers/auth.controller');
const isAuth = require('../middlewares/is-auth');

router.post(
  '/signup',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) return Promise.reject('E-Mail address already exists!');
        });
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty(),
  ],
  authController.signup
);

router.post('/signin', authController.signin);

router.get('/status', isAuth, authController.getUserStatus);

router.patch(
  '/status',
  isAuth,
  [body('status').trim().not().isEmpty()],
  authController.updateUserStatus
);

module.exports = router;
