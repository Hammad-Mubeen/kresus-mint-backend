const { fork } = require("child_process");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorMiddleware = require("./middlewares/error");
const headerAccessMiddleware = require("./middlewares/headerAccess");
const apiRoutes = require("./routes/index");

var { graphqlHTTP } = require("express-graphql");

const schemaQuery = require("./schema/schema");
const app = express();

app.use(morgan("dev"), headerAccessMiddleware, cors());
app.use((req, res, next) => {
  if (req.originalUrl.endsWith("/webhook")) {
    next();
  } else {
    express.json({ limit: "50mb" })(req, res, next);
  }
});
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schemaQuery,
    // rootValue: root,
    graphiql: true,
  })
);

app.get("/", function (req, res) {
  return res.send("DataBlitzer APIs");
});

app.use("/v1", apiRoutes);
app.use(errorMiddleware);

// Adding CSV Tracker Data to Database if it's not already present PS it's done on a separate thread
// PS it's done on a separate thread

setTimeout(async () => {
  const forkedChild = fork(`${__dirname}/utils/addTrackersToDB.js`);
  forkedChild.send({ signal: true });
  forkedChild.on("exit", (msg) => {
    console.log(`Child process exited with code ${msg}`);
  });
}, 5000);

module.exports = app;
