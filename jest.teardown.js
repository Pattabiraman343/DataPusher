// jest.teardown.js
export default async () => {
  try {
    // ✅ Close Sequelize connection
    const { sequelize } = await import("./src/models/Index.js"); // Capital I
    if (sequelize && sequelize.close) {
      await sequelize.close();
      console.log("🛑 Sequelize connection closed.");
    }

    // ✅ Close DB pool if using raw pool
    const db = await import("./src/config/db.js");
    if (db && db.end) {
      await db.end();
      console.log("🛑 DB pool connection closed.");
    }

    // ✅ Stop background workers
    const worker = await import("./src/workers/dataWorker.js");
    if (worker && worker.stop) {
      await worker.stop();
      console.log("🛑 Data worker stopped.");
    }
  } catch (err) {
    console.error("Global teardown error:", err.message);
  }
};
