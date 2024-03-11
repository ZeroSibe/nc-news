const cors = require("cors");
const express = require("express");
const app = express();
const apiRouter = require("./routes/api-router");

app.use(cors());

const {
  customErrors,
  serverErrors,
  psqlErrors,
} = require("./controllers/errors.controllers");

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Path Not Found" });
});

app.use(customErrors);
app.use(psqlErrors);
app.use(serverErrors);

module.exports = app;
