import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/JoinRoom/JoinRoom.css";

const JoinRoom = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [role, setRole] = useState("student");

  return (
    <>
      <div className="container">
        <div className="join-room-inner">
          <div className="card">
            <div className="heading">Join Room</div>
            <div className="content m-1">
              Join any room by creating or using a room id
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter Your Name to display"
                className="text-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter or create a Room ID"
                className="text-field"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
            <div>
              <select
                className="text-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>student</option>
                <option>teacher</option>
              </select>
            </div>
            <Link
              onClick={(e) => (!name || !room ? e.preventDefault() : null)}
              to={`/room=${room}/name=${name}/role=${role}`}
            >
              <button>Join Room</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default JoinRoom;
