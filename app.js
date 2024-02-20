const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api.controllers");
const { getTopics } = require("./controllers/topics.controllers");
const {
  getArticles,
  getAllArticles,
  patchArticle,
} = require("./controllers/articles.controllers");

const {
  customErrors,
  serverErrors,
  psqlErrors,
} = require("./controllers/errors.controllers");
const {
  getCommentsById,
  postCommentByArticleID,
  deleteComment,
} = require("./controllers/comments.controller");
app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsById);

app.post("/api/articles/:article_id/comments", postCommentByArticleID);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Path Not Found" });
});

app.use(customErrors);
app.use(psqlErrors);
app.use(serverErrors);

module.exports = app;
