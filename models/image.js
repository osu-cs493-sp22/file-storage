const fs = require('fs')
const { ObjectId, GridFSBucket } = require('mongodb');

const { getDBReference } = require('../lib/mongo');

exports.saveImageFile = function (image) {
  return new Promise(function (resolve, reject) {
    const db = getDBReference()
    const bucket = new GridFSBucket(db, { bucketName: 'images' })
    const metadata = {
      userId: image.userId,
      mimetype: image.mimetype
    }
    const uploadStream = bucket.openUploadStream(image.filename, {
      metadata: metadata
    })
    fs.createReadStream(image.path).pipe(uploadStream)
      .on('error', function (err) {
        reject(err)
      })
      .on('finish', function (result) {
        console.log("== stream result:", result)
        resolve(result._id)
      })
  })
}

exports.saveImageInfo = async function (image) {
  const db = getDBReference();
  const collection = db.collection('images');
  const result = await collection.insertOne(image);
  return result.insertedId;
};

exports.getImageInfoById = async function (id) {
  const db = getDBReference();
  // const collection = db.collection('images');
  const bucket = new GridFSBucket(db, { bucketName: 'images' })

  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await bucket.find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
};

exports.getImageDownloadStream = function(filename) {
  const db = getDBReference()
  const bucket = new GridFSBucket(db, { bucketName: 'images' })
  return bucket.openDownloadStreamByName(filename)
}
