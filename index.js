const io = require("socket.io")(8900, {
    cors: {
      origin: "https://animecon-frontend.vercel.app/",
    },
  });
  
  let users = [];
  
  const addUser = (userId, socketId) => {
    users = users.filter((user) => user.userId !== userId); // Remove duplicate userId
    users.push({ userId, socketId });
  };
  
  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };
  
  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  
  io.on("connection", (socket) => {
    // when connected
    console.log(`A user connected. ${socket.id}`);
  
    // take userId and socketId from user
    socket.on("addUser", (userId) => {
    
      addUser(userId, socket.id);
      io.emit("getUsers", users);
        console.log(`User added: ${userId}`);
    });
  
    // send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      if (user) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
        io.to(user.socketId).emit("newMessageNotification", { senderId });
      }
    });
  
    // when disconnected
    socket.on("disconnect", () => {
      console.log("A user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
  