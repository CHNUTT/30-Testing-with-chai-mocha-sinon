const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const { createError } = require('../utils/helper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_TOKEN } = require('../utils/config');
const { create } = require('../models/user.model');

exports.signup = async (req, res, next) => {
  try {
    // INFO check validation Error
    const validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      const error = createError('Validation Error', 422);
      error.data = validationError.array();
      throw error;
    }

    const { email, password, name } = req.body;

    // INFO create hashed password
    const hashedPassword = await bcrypt.hash(password, 12);
    if (!password) throw createError('Server is down', 500);

    // INFO create user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    // INFO save the new user
    const createdUser = await newUser.save();
    if (!createdUser) throw createError('Server is down', 500);

    // INFO return new user
    res.status(201).json({ message: 'User created!', userId: createdUser._id });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw createError('Invalid credential', 401);

    const isAuthen = await bcrypt.compare(password, user.password);
    if (!isAuthen) throw createError('Invalid credential', 401);

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      SECRET_TOKEN,
      { expiresIn: '1hr' }
    );

    return res.status(200).json({ token, userId: user._id.toString() });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
    return error;
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) throw createError('User not found.', 404);

    res.status(200).json({ status: currentUser.status });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    // INFO validate status
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw createError(errors[0].msg, 422);

    const { status } = req.body;

    // INFO validate user
    const currentUser = await User.findById(req.userId);
    if (!currentUser) throw createError('User not found', 404);

    // INFO Update user status in database
    currentUser.status = status;
    const updatedUser = await currentUser.save();

    // INFO return back message and updated user info
    res.status(200).json({
      message: 'User updated',
      user: { _id: updatedUser._id, name: updatedUser.name },
    });
  } catch (error) {
    next(error);
  }
};
