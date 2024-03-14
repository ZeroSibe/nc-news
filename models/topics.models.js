const db = require("../db/connection");

exports.selectTopics = (topic) => {
  const queryVals = [];
  let sqlString = `SELECT * FROM topics`;
  if (topic) {
    sqlString += ` WHERE slug = $1`;
    queryVals.push(topic);
  }
  return db.query(sqlString, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Topic Not Found" });
    }
    return rows;
  });
};

