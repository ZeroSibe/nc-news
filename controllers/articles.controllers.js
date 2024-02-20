const {
  selectArticleByID,
  selectArticle,
  selectCommentsArticleByID,
} = require("../models/articles.models");

exports.getAllArticles = (req, res, next) => {
  selectArticle()
    .then((articles) => {
      res.status(200).send({ articles });
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

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsArticleByID(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
