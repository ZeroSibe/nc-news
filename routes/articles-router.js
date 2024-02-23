const {
  getAllArticles,
  getArticles,
  patchArticle,
} = require("../controllers/articles.controllers");
const {
  getCommentsById,
  postCommentByArticleID,
} = require("../controllers/comments.controller");

const articlesRouter = require("express").Router();

articlesRouter.get("/", getAllArticles);

articlesRouter.route("/:article_id").get(getArticles).patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsById)
  .post(postCommentByArticleID);

module.exports = articlesRouter;
