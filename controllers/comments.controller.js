const { selectArticleByID } = require("../models/articles.models");
const {
  selectCommentsArticleByID,
  insertComment,
  deleteCommentById,
} = require("../models/comments.models");

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsArticleByID(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  const promises = [
    selectArticleByID(article_id),
    insertComment(article_id, newComment),
  ];
  return Promise.all(promises)
    .then((returnedPromises) => {
      res.status(201).send({ comment: returnedPromises[0] });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
