import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import JoinRoom from "./components/JoinRoom/JoinRoom";
import ChatRoom from "./components/ChatRoom/ChatRoom";
import "./assets/common/default.css";

class Routes extends Component {
  state = {};
  render() {
    return (
      <>
        <Router>
          <Route exact path="/" component={JoinRoom} />
          <Route exact path="/room=:room/name=:name/role=:role" component={ChatRoom} />
        </Router>
      </>
    );
  }
}

export default Routes;
