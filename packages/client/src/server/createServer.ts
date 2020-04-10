import express from 'express';
import socketio from "socket.io";
import * as path from "path";

export default function() {
  const app = express();
  var http = require('http').Server(app);
  let io = socketio(http);

  app.get('/', (req: any, res: any) => {
    res.send('hello world');
  });

  io.on("connection", function(socket: any) {
    console.log("a user connected");
  });

  return http;
}
