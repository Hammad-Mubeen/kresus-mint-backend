const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error");
const headerAccessMiddleware = require("./middlewares/headerAccess");
const apiRoutes = require("./routes/index");

const app = express();

app.use(headerAccessMiddleware, cors());
app.use((req, res, next) => {
  if (req.originalUrl.endsWith("/webhook")) {
    next();
  } else {
    express.json({ limit: "50mb" })(req, res, next);
  }
});

app.get("/", function (req, res) {
  return res.send("Kresus Mint Backend APIs");
});

app.use("/v1", apiRoutes);
app.use(errorMiddleware);

module.exports = app;
