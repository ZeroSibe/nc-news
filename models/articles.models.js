const db = require("../db/connection");

exports.selectArticle = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBys = [
    "title",
    "topic",
    "author",
    "article_id",
    "created_at",
    "votes",
    "comment_count",
  ];
  if (!validSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }
  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }
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
  ORDER BY ${sort_by} ${order};`;

  return db.query(sqlString, queryVals).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleByID = (article_id) => {
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, articles.body, 
    ROUND(COUNT(comments.comment_id)) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
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
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return rows[0];
    });
};

exports.selectArticlesByTopic = (topic) => {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
      return db.query(
        `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
        COUNT(comments.comment_id)::INT AS comment_count 
        FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id 
        WHERE topic = $1 
        GROUP BY articles.article_id 
        ORDER BY created_at`,
        [topic]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};
