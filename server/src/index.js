const express = require('express');
const { join } = require('path');
const rootDir = require('./utils/path');
const multer = require('multer');
const { v4: uudiv4 } = require('uuid');
const cors = require('cors');

// TODO initiate app from express
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(rootDir, 'public', 'images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${uudiv4()}_${file.originalname}`);
  },
});

const fileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
  if (!fileTypes.includes(file.mimetype)) cb(null, false);
  cb(null, true);
};

// TODO LOAD route
const feedRoutes = require('./routes/feed.routes');
const authRoutes = require('./routes/auth.routes');

// TODO Register middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// TODO Register multer
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

// TODO serve public folders
app.use('/images', express.static(join(rootDir, 'public', 'images')));

app.use(cors());

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Methoods',
//     'GET, POST, PUT, PATCH, DELETE'
//   );
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });

// TODO Register routes
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// TODO Error handling route
app.use((error, req, res, next) => {
  // console.log(error);
  const { statusCode = 500, message, data } = error;
  res.status(statusCode).json({ message, data });
});

// TODO set PORT
const PORT = process.env.PORT || 3000;

const init = async () => {
  try {
    const connection = await require('./utils/database').mongoConnect();

    if (!connection) throw new Error('Cannot connect to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

init();
