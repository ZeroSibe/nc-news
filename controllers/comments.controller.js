const { selectArticleByID } = require("../models/articles.models");
const {
  selectCommentsArticleByID,
  insertComment,
  deleteCommentById,
} = require("../models/comments.models");

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [selectCommentsArticleByID(article_id)];
  if (article_id) {
    promises.push(selectArticleByID(article_id));
  }
  Promise.all(promises)
    .then((returnedPromises) => {
      res.status(200).send({ comments: returnedPromises[0] });
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
