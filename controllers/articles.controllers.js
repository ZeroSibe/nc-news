const {
  selectArticleByID,
  selectArticle,
  updateArticle,
} = require("../models/articles.models");
const { selectTopics } = require("../models/topics.models");

exports.getAllArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  const promises = [selectArticle(sort_by, order, topic)];

  if (topic) {
    promises.push(selectTopics(topic));
  }

  Promise.all(promises)
    .then((returnedPromises) => {
      res.status(200).send({ articles: returnedPromises[0] });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleByID(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticle(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
