#!/usr/bin/env node
require("dotenv").config();
const debug = require("debug")("99starz:server");
const http = require("http");
const app = require("../src/app");
const { SERVER_PORT } = process.env;

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(SERVER_PORT || "3000");
console.log(`Server running at 127.0.0.1:${port}`);
const server = http.createServer(app);
server.listen(port);

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
};

server.on("error", onError);
server.on("listening", onListening);

module.exports = server;
