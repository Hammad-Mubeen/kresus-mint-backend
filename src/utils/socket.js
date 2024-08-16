const socket = (io) => {
  io.sockets.on("connection", function (client) {
    io.socketsJoin("resp");
  });
};

module.exports = socket;
