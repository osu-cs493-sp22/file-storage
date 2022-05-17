const express = require('express');
const multer = require('multer')
const crypto = require('crypto')

const { connectToDB } = require('./lib/mongo');
const { getImageInfoById, saveImageInfo } = require('./models/image');

const app = express();
const port = process.env.PORT || 8000;

const fileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif'
}

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: function (req, file, callback) {
      const ext = fileTypes[file.mimetype]
      const filename = crypto.pseudoRandomBytes(16).toString('hex')
      callback(null, `${filename}.${ext}`)
    }
  }),
  fileFilter: function (req, file, callback) {
    callback(null, !!fileTypes[file.mimetype])
  }
})

app.get('/', (req, res, next) => {
  res.status(200).sendFile(__dirname + '/index.html');
});

app.post('/images', upload.single('image'), async function (req, res, next) {
  console.log("== req.file:", req.file)
  console.log("== req.body:", req.body)
  if (req.file && req.body && req.body.userId) {
    const image = {
      userId: req.body.userId,
      path: req.file.path,
      filename: req.file.filename,
      mimetype: req.file.mimetype
    }
    const id = await saveImageInfo(image)
    res.status(200).send({ id: id })
  } else {
    res.status(400).send({
      err: 'Request body needs an "image" and a "userId"'
    })
  }
})

app.get('/images/:id', async (req, res, next) => {
  try {
    const image = await getImageInfoById(req.params.id);
    if (image) {
      image.url = `/media/images/${image.filename}`
      res.status(200).send(image);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

// app.get('/media/images/:filename')

app.use('/media/images/', express.static(`${__dirname}/uploads`))

app.use('*', (req, res, next) => {
  res.status(404).send({
    err: "Path " + req.originalUrl + " does not exist"
  });
});

connectToDB(() => {
  app.listen(port, () => {
    console.log("== Server is running on port", port);
  });
});
