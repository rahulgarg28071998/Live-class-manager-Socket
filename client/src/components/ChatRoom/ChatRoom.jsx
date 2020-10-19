import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../../assets/ChatRoom/ChatRoom.css";
import swal from "sweetalert";

let socket;
let ENDPOINT = "https://camp12k-server.herokuapp.com/";
// let ENDPOINT = "http://localhost:8000/";

const ChatRoom = (props) => {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [session, setSession] = useState({});
  const [messages, setMessages] = useState([]);
  const [isStarted, setIsStarted] = useState(false);

  const [name, setName] = useState("");

  useEffect(() => {
    const { room, name, role } = props.match.params;
    socket = io(ENDPOINT);
    setRoom(room);
    setName(name);

    socket.on("SessionEnded", () => {
      if (session.teacher && session.teacher.teacherId.name !== name) {
        setTimeout(() => {
          swal("Meeting has been ended", "", "warning").then(() => {
            socket.off();
            window.location.href = "/";
          });
        }, 2000);
      }
    });

    socket.emit("join", { name, room, role });
    socket.on("err", ({ error }) => {
      swal(error, "", "error").then(() => (window.location.href = "/"));
    });
    socket.on("deleteUser", () => {
      swal(
        "Admin removed you",
        "You have been removed from the room",
        "error"
      ).then(() => {
        socket.off();
        window.location.href = "/";
      });
    });
    return () => {
      socket.emit("disconnect", { name, room });
      socket.off();
    };
  }, [props.match.params, session]);

  const handleSendButton = () => {
    if (message) {
      socket.emit("sendMessage", { name, room, message });
      setMessage("");
    } else {
      swal("Empty Message Field", "", "warning");
    }
  };
  const handleUserDelete = (id) => {};

  const startSession = () => {
    setIsStarted(true);
    socket.emit("startSession", { room });
  };
  const endSession = () => {
    setIsStarted(false);
    socket.emit("endSession", { room });
  };
  useEffect(() => {
    socket.on("totalMembers", ({ session }) => {
      setSession({ ...session });
    });
  }, [session]);

  useEffect(() => {
    socket.on("message", ({ user, text, session }) => {
      // setSession(session);
      setMessages([...messages, { user, text }]);
    });
  }, [messages]);

  return (
    <>
      <div className="container">
        <div className="chat-room-main-grid">
          <div className="card m-1">
            <div className="chat-container">
              <div>Room: {room}</div>
              <div>
                {session.isStarted ? (
                  <>
                    <div className="green circle"></div>Session is started
                  </>
                ) : (
                  <>
                    <div className="red circle"></div>
                    Session is ended or not started yet
                  </>
                )}
              </div>
              <div className="chat-inner">
                {/* Message container */}
                {messages.map((data, index) => (
                  <div
                    className="m-1 chat-message-container"
                    key={`message-${index}`}
                  >
                    <div>{data.user}:</div>
                    <div>{data.text}</div>
                  </div>
                ))}
                {/* Message container */}
              </div>
              <div className="chat-input-grid">
                <div className="justify-center">
                  <input
                    className="text-field text-field-1"
                    value={message}
                    placeholder="Type a message to send"
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) =>
                      e.keyCode === 13 ? handleSendButton() : null
                    }
                  />
                </div>
                <div className="justify-center">
                  <button onClick={handleSendButton}>Send</button>
                </div>
                <div>
                  {session.teacher &&
                  session.teacher.teacherId.name === name ? (
                    <>
                      <button onClick={startSession} disabled={isStarted}>
                        Start Session
                      </button>
                      <br />
                      <button onClick={endSession} disabled={!isStarted}>
                        End Session
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="card m-1">
            <div className="chat-container-1">
              <div>Teacher in the room</div>
              <div className="chat-inner p-0-5">
                {session.teacher ? session.teacher.teacherId.name : null}
              </div>
              <div>Students in the room</div>
              <div className="chat-inner p-0-5">
                {session.students
                  ? session.students.map((user, index) => (
                      <div
                        key={`users-${index}`}
                        onClick={() => handleUserDelete(user.id)}
                        className="strike-th p-0-5"
                      >
                        {user.studentId.name}
                      </div>
                    ))
                  : null}
              </div>
              <div>
                Total Members:{" "}
                {session.teacher ? session.students.length + 1 : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
