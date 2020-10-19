const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
// const cors = require("cors");

const connectDB = require("./config/DB");
const Classroom = require("./models/Session");
const router = require("./router");
const userFunctions = require("./users");
const { getUser } = require("./users");

const app = express();
// app.use(cors({ origin: "*" }));
app.use(router);
connectDB();
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = socketIO(server);
// const listenIO = require("socket.io").listen(server);
// io.set("origins", "*");

io.on("connection", async (socket) => {
  socket.on("join", async ({ name, room, role }) => {
    try {
      await userFunctions.loginUser({ name, role, socketId: socket.id });
      const { error, user } = await userFunctions.addUsers({
        id: socket.id,
        name,
        room,
      });
      if (error) {
        socket.emit("err", { error });
      }
      socket.emit("message", {
        user: "admin",
        text: `Hi ${name}, Welcome to the ${room} room.`,
      });
      socket.broadcast.to(room).emit("message", {
        user: "admin",
        text: `${name} has joined the room`,
      });
      socket.join(room);
      let cur_session = await userFunctions.getUsersInRoom(room);
      io.to(room).emit("totalMembers", { session: cur_session });
    } catch (err) {}
  });

  // socket.on("removeUser", (name, room) => {
  //   const user = userFunctions.getUser(name);
  //   io.to(user.room).emit("message", {
  //     user: "admin",
  //     text: `${user.name} has been removed by admin`,
  //   });
  //   io.to(user.id).emit("deleteUser");
  //   userFunctions.removeUser(name, room);
  //   let totalMembers = userFunctions.getUsersInRoom(room);
  //   io.to(user.room).emit("totalMembers", { totalMembers });
  // });

  socket.on("startSession", async ({ room }) => {
    const classroom = await Classroom.findOne({ name: room });
    classroom.isStarted = true;
    classroom.startTime = new Date();
    await classroom.save();
    let cur_session = await userFunctions.getUsersInRoom(room);
    io.to(room).emit("totalMembers", { session: cur_session });
  });
  socket.on("endSession", async ({ room }) => {
    const classroom = await Classroom.findOne({ name: room });
    classroom.isStarted = false;
    let date = new Date();
    classroom.endTime = date;
    classroom.students.forEach((student) => {
      student.exitTime = date;
    });
    await classroom.save();
    let cur_session = await userFunctions.getUsersInRoom(room);
    io.to(room).emit("totalMembers", { session: cur_session });
    socket.emit("SessionEnded");
  });

  socket.on("sendMessage", ({ message, name, room }) => {
    try {
      io.to(room).emit("message", { user: name, text: message });
    } catch (err) {}
  });

  socket.on("disconnect", async ({ name, room }) => {
    const user = getUser(name);
    try {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${name} has left the room`,
      });
      userFunctions.removeUser(name, room);
      let cur_session = await userFunctions.getUsersInRoom(room);
      io.to(room).emit("totalMembers", { session: cur_session });
    } catch (err) {}
  });
});

server.listen(port, () => {
  console.log(`Listening on PORT: ${port}`);
});
