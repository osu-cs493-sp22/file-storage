/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDbName = process.env.MONGO_DB_NAME;
const mongoAdminDbName = process.env.MONGO_ADMIN_DB_NAME || mongoDbName;

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoAdminDbName}`;

let db = null;

exports.connectToDB = function (callback) {
  MongoClient.connect(mongoUrl, (err, client) => {
    db = client.db(mongoDbName);
    callback();
  });
};

exports.getDBReference = function () {
  return db;
};
