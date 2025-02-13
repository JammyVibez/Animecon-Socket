const { addUser, removeUser, getUser } = require("./context");
const Community = require("../models/Community"); // Assuming your Community model is in ../models
const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`Community socket connected: ${socket.id}`);

    // Join a community room
    socket.on("joinCommunity", async ({ userId, communityId }) => {
      try {
        const community = await Community.findById(communityId);
        if (!community) {
          return socket.emit("error", { message: "Community not found" });
        }

        // Join the room
        socket.join(communityId);
        console.log(`User ${userId} joined community ${communityId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to join community" });
      }
    });

    // Send a message to a community
    socket.on("sendCommunityMessage", async ({ senderId, communityId, content }) => {
      try {
        const community = await Community.findById(communityId);
        if (!community) {
          return socket.emit("error", { message: "Community not found" });
        }

        // Save the message
        const message = new Message({ community: communityId, sender: senderId, content });
        await message.save();

        // Emit the message to the community room
        io.to(communityId).emit("receiveCommunityMessage", {
          senderId,
          content,
          createdAt: message.createdAt,
        });

        console.log(`Message sent to community ${communityId} by user ${senderId}`);
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Disconnect from the socket
    socket.on("disconnect", () => {
      console.log(`Community socket disconnected: ${socket.id}`);
      removeUser(socket.id);
    });
  });
};
