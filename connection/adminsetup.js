
const db = require('../connection/connect');
const consts = require('./consts');

const runAdminSetup = async () => {
    console.log("🛠 Checking admin setup...");
    try {
        await db.get().collection(consts.subadmin).insertOne({ name: "admin", password: "admin123", district: "alappuzha" });
        console.log("✅ Admin user ok");
    } catch (error) {
        console.error("❌ Admin setup failed:", error.message);
    }
};

module.exports = {
    runAdminSetup,
};
