const db = require("../db/connection");

exports.selectCommentsArticleByID = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments 
    WHERE article_id = $1
    ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return rows;
    });
};

exports.insertComment = (articleId, newComment) => {
  const { username, body } = newComment;
  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(
      `INSERT INTO comments (body, votes, author, article_id) VALUES ($1, 0, $2, $3) RETURNING *;`,
      [body, username, articleId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.deleteCommentById = (commentId) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1;`, [commentId])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
    });
};
