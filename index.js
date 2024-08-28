require("dotenv").config();
const express = require("express");
const errorMiddleware = require("./src/middlewares/error");

const debug = require("debug")("kresis-mint:server");
const http = require("http");
const apiRoutes = require("./src/routes/index");
const { SERVER_PORT } = process.env;

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/", function (req, res) {
  return res.send("Kresus Mint Backend APIs");
});

app.use("/v1", apiRoutes);
app.use(errorMiddleware);

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

module.exports = app;
