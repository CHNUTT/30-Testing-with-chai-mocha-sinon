const { validationResult } = require('express-validator');
const { createError, removeImage } = require('../utils/helper');
const Post = require('../models/post.model');
const User = require('../models/user.model');

exports.getPosts = async (req, res, next) => {
  try {
    const { page: currentPage = 1 } = req.query;
    const perPage = 10;

    let totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .populate({ path: 'creator', select: 'name' })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      message: 'Fetched posts successfully',
      posts,
      totalItems,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) throw createError('Could not find a post.', 404);

    res.status(200).json({
      message: 'Post fetched.',
      post,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.postPost = async (req, res, next) => {
  try {
    // INFO 1. Validate incoming data
    const errors = validationResult(req);
    if (!errors.isEmpty())
      throw createError('Validation failed, entered data is incorrect.', 422);

    const { title, content } = req.body;

    // INFO 2. Retreive file data if any
    const { file, userId: currentUserId } = req;
    if (!file) throw createError('No image provided', 422);

    // INFO 3. Create Post
    const post = new Post({
      title,
      content,
      imageUrl: `${file.path.replace('/app/src/public', '')}`,
      creator: currentUserId,
    });

    // INFO 4. Save post to DB
    const createdPost = await post.save();
    if (!createdPost)
      throw createError('Error on creating post, try again later', 500);

    // INFO 5. Retreive user data from current user
    const creator = await User.findById(currentUserId);

    // INFO 6. Push that createdPost (use post not createdPost) to the user
    creator.posts.push(post);
    await creator.save();

    // INFO 7.
    return res.status(201).json({
      message: 'Post created successfully',
      post: createdPost,
      creator: {
        _id: creator._id,
        name: creator.name,
      },
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    // INFO Check validation error
    const errors = validationResult(req);
    if (!errors.isEmpty())
      throw createError('Validation failed, entered data is incorrect.', 422);

    // INFO Validate Authorization
    const { postId } = req.params;
    // INFO pull post data
    const post = await Post.findById(postId);
    if (!post) throw createError('Could not find post.', 404);
    if (post.creator.toString() !== req.userId)
      throw createError('Not authorized!', 403);

    // INFO check image change||no change||no image at all
    let { image: imageUrl } = req.body;
    if (req.file) imageUrl = req.file.path.replace('/app/src/public', '');
    if (!imageUrl) throw createError('No file picked', 422);

    const { title, content } = req.body;
    const oldImage = post.imageUrl;

    // TODO update data
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    // TODO save updated data
    const updatedPost = await post.save();
    if (!updatedPost) throw createError('Server is down', 500);

    // TODO remove old photo
    if (req.file) removeImage(oldImage);

    // TODO return result
    res.status(200).json({ message: 'Post updated!', post: updatedPost });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) throw createError('Could not find post!', 404);
    if (post.creator.toString() !== req.userId)
      throw createError('Not authorized!', 403);

    // TODO Check the user

    const oldImage = post.imageUrl;

    const deletedPost = await Post.findByIdAndRemove(postId);
    if (!deletedPost) throw createError('Server down', 500);

    removeImage(oldImage);

    // INFO clear the post from user posts array
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    res
      .status(200)
      .json({ message: 'Successfully delete post', post: deletedPost });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
