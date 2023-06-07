const Chat = require("../models/Chat");
const { Message } = require("../models/Message");
const express = require("express");
const app = express();
const connectToDb = require("../config/db_connection");
require("dotenv").config({ path: "../.env" });

// process.env.IP_ADDR || "localhost",
// Start server
app.listen(process.env.PORT, process.env.IP_ADDR || "localhost", () => {
  console.log(`> server is running in ${process.env.NODE_ENV}`);
});

// Connect to database
connectToDb();

async function migrateLatestMessages() {
  // Find all chat documents
  const chats = await Chat.find();

  // Iterate over each chat document
  for (const chat of chats) {
    // Find the latest message for the chat
    const latestMessage = await Message.findOne({ chatId: chat._id })
      .sort({ createdAt: -1 })
      .select("_id");

    // Update the chat document with the latestMessage field
    await Chat.updateOne(
      { _id: chat._id },
      { latestMessage: latestMessage._id }
    );
  }

  console.log("Migration completed successfully");
}

// Run the migration
migrateLatestMessages().catch(console.error);
