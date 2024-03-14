const { getArticlesByTopic } = require("../controllers/articles.controllers");
const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics.controllers");

topicsRouter.get("/", getTopics);
topicsRouter.route("/:topic").get(getArticlesByTopic);

module.exports = topicsRouter;
