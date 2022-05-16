const express = require('express');

const { connectToDB } = require('./lib/mongo');
const { getImageInfoById } = require('./models/image');

const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res, next) => {
  res.status(200).sendFile(__dirname + '/index.html');
});

app.get('/images/:id', async (req, res, next) => {
  try {
    const image = await getImageInfoById(req.params.id);
    if (image) {
      res.status(200).send(image);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

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
