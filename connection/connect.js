var mongoClient = require("mongodb").MongoClient;
var promise = require("promise");

var state = {
  db: null,
};
module.exports = {
  Database_connection: () => {
    return new promise((resolve, reject) => {
      var dbname = "part-time_job-pool";
      mongoClient.connect("mongodb://127.0.0.1:27017",{ useNewUrlParser: true, useUnifiedTopology: true },(err, data) => {
        if (err) {
          reject(
            "Database Connection Error...",err);
        } else {
          state.db = data.db(dbname);
          resolve("Database Connection Success...");
        }
      });
    });
  },
  get: () => {
    return state.db;
  },
};
