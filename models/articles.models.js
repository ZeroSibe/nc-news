const db = require("../db/connection");

exports.selectArticle = (topic) => {
  const queryVals = [];
  let sqlString = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
  ROUND(COUNT(comments.comment_id)) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id`;

  if (topic) {
    sqlString += ` WHERE articles.topic = $1`;
    queryVals.push(topic);
  }

  sqlString += ` GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`;

  return db.query(sqlString, queryVals).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleByID = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return rows[0];
    });
};

exports.updateArticle = (articleId, newVote) => {
  if (isNaN(Number(newVote))) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [newVote, articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return rows[0];
    });
};
