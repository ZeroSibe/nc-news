const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");
const {
  getArticles,
  getAllArticles,
} = require("./controllers/articles.controllers");
const {
  customErrors,
  serverErrors,
  psqlErrors,
} = require("./controllers/errors.controllers");
const endpoints = require("./endpoints.json");

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});
app.get("/api/topics", getTopics);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id", getArticles);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Path Not Found" });
});

app.use(customErrors);
app.use(psqlErrors);
app.use(serverErrors);

module.exports = app;
