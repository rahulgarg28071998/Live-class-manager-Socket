//const users = [];
const mongoose = require("mongoose");
const User = require("./models/User");
const Classroom = require("./models/Session");
const { use } = require("./router");
const userFunctions = {};

userFunctions.addUsers = async ({ id, name, room }) => {
  try {
    name = name.trim();
    room = room.trim().toLowerCase();
    // (user) => user.name === name && user.room === room
    const IsExistingSession = await Classroom.findOne({ name: room });
    if (!IsExistingSession) {
      const user = await User.findOne({ name });
      if (!user) return { error: "user doesn't exist try a valid Id" };
      user.socketId = id;
      await user.save();
      let cur_date = new Date();
      cur_date.setDate(cur_date.getDate() + 10);
      if (user.role === "teacher") {
        const newSession = new Classroom({
          name: room,
          isStarted: false,
          teacher: { teacherId: user._id },
          endTime: cur_date,
        });
        await newSession.save();
        return user;
      }
      if (user.role === "student") return { error: "invalid meeting Id" };
      else {
        return { error: "don't have access" };
      }
    } else {
      const user = await User.findOne({ name });
      if (!user) return { error: "user doesn't exist try a valid Id" };
      user.socketId = id;
      await user.save();
      if (
        user.role === "student" &&
        IsExistingSession.endTime.getTime() > new Date().getTime()
      ) {
        if (!IsExistingSession.isStarted) {
          return { error: "Meeting has not yet started" };
        }
        const hasUser = IsExistingSession.students.filter(
          (c) => c.studentId.toString() === user._id.toString()
        );
        if (!hasUser.length) {
          IsExistingSession.students.push({
            studentId: user._id,
          });
          await IsExistingSession.save();
        }
        return user;
      }
      if (user.role === "student") {
        return { error: "meeting ended" };
      } else {
        if (user.name === name) return user;
        return { error: "session is taken by another teacher" };
      } //teacher try to enter
    }
  } catch (err) {}
};

userFunctions.removeUser = async (name, room) => {
  try {
    const IsExistingSession = await Classroom.findOne({ name: room });
    if (IsExistingSession) {
      const existingUser = await User.findOne({ name });
      let currentDate = new Date();
      if (existingUser) {
        if (existingUser.role === "teacher") {
          IsExistingSession.endTime = currentDate;
          IsExistingSession.isStarted = false;
          IsExistingSession.students.forEach((c) => {
            c.exitTime = currentDate;
          });
        } else {
          const exist_id = IsExistingSession.students.findIndex(
            (c) => c.studentId === existingUser._id
          );
          IsExistingSession.students[exist_id].exitTime = currentDate;
        }
        await IsExistingSession.save();
      }
    } else return { error: "session doesn't exists" };
  } catch (err) {}
};

userFunctions.getUser = async (name) => {
  try {
    await User.findOne({ name });
  } catch (err) {}
};

userFunctions.getUsersInRoom = async (room) => {
  try {
    let cur_session = await Classroom.findOne({ name: room })
      .populate({
        path: "students",
        populate: {
          path: "studentId",
        },
      })
      .populate({
        path: "teacher",
        populate: { path: "teacherId" },
      });
    return cur_session;
  } catch (err) {}
};

userFunctions.loginUser = async ({ name, role, socketId }) => {
  try {
    const userExist = await User.findOne({ name });
    if (!userExist) {
      const user = new User({
        name,
        role,
        socketId,
      });
      await user.save();
    } else {
      userExist.socketId = socketId;
      await userExist.save();
    }
  } catch (err) {}
};

module.exports = userFunctions;
