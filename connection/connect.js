const { MongoClient } = require("mongodb");

const state = {
  db: null,
};

const localUrl = "mongodb://localhost:27017"

module.exports = {
  Database_connection: async () => {
    const username = "asadasu445";
    const password = encodeURIComponent("dYJeEj4nf06oj7Mg"); // Make sure it's URL encoded
    const dbName = "part-time_job-pool";
    const uri = `mongodb+srv://${username}:${password}@parttime.swqa3fh.mongodb.net/${dbName}?retryWrites=true&w=majority`;

    try {
      const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await client.connect();
      state.db = client.db(dbName);
      console.log("✅ Database Connection Success...");
      return "Database Connection Success...";
    } catch (err) {
      console.error("❌ Database Connection Error:", err);
      throw err;
    }
  },

  get: () => {
    return state.db;
  },
};
