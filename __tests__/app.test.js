const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
const { convertTimestampToDate } = require("../db/seeds/utils");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
  test("GET 200 - responds with an object describing all the avalable endpoints on your API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        for (const endpoint in endpoints) {
          expect(endpoints[endpoint]).toHaveProperty("description");
          //not all endpoints has the below two, might compare actual JSON file instead...
          if (endpoint === "queries") {
            expect(endpoint).toMatchObject({
              queries: expect.any(Array),
            });
          }
          if (endpoint === "exampleResponse") {
            expect(endpoint).toMatchObject({
              queries: expect.any(Object),
            });
          }
          //need to add format body, once I can see how it looks
        }
      });
  });

  describe("GET /api/topics", () => {
    test("GET 200 - responds with an array of topic objects with the relevant properties", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((response) => {
          const topics = response.body.topics;
          expect(topics).toHaveLength(3);
          expect(Array.isArray(topics)).toBe(true);
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
    test("GET 404 - should return appropriate status and message for bad path", () => {
      return request(app)
        .get("/api/topicss")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Path Not Found");
        });
    });
  });
});

describe("GET /api/articles", () => {
  test("GET 200 - responds with an articles array of article objects with the relevant properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });

  test("GET 200 sort articles by date if no query is provided", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
      });
  });

  test("GET 404 - should return appropriate status and message for bad path", () => {
    return request(app)
      .get("/api/articless")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Path Not Found");
      });
  });
});

describe("GET /api/articles ?topic", () => {
  test("GET 200 - filters the articles by the topic value specified in the query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(1);
        articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });
  test("GET 200 - responds with an empty array when topic value exists but has no associated articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(0);
      });
  });
  test("GET 404 - if query value is valid but does not exist", () => {
    return request(app)
      .get("/api/articles?topic=turtles99")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET 200 /api/articles/:article_id - responds an article object, which should have the relevant properties", () => {
    const articleId = 2;
    return request(app)
      .get(`/api/articles/${articleId}`)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: articleId,
          article_id: expect.any(Number),
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          created_at: "2020-10-16T05:03:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("GET 404 - responds with approriate status and message, when the request has invalid article id number", () => {
    const articleId = 999;
    return request(app)
      .get(`/api/articles/${articleId}`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
  test("GET 400 - responds with approriate status and message, when the request has invalid article id type", () => {
    const articleId = "forkLift";
    return request(app)
      .get(`/api/articles/${articleId}`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  describe("GET /api/articles/:article_id (comment_count)", () => {
    test("GET 200 /api/articles/:article_id - responds an article object, which should have the relevant properties including a comment_count", () => {
      const articleId = 9;
      return request(app)
        .get(`/api/articles/${articleId}`)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            article_id: articleId,
            created_at: convertTimestampToDate(1591438200000),
            comment_count: expect.any(Number),
            comment_count: 2,
          });
        });
    });
    test("GET 200 /api/articles/:article_id - if comment is not yet made for referenced article", () => {
      const articleId = 2;
      return request(app)
        .get(`/api/articles/${articleId}`)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            article_id: articleId,
            created_at: convertTimestampToDate(1602828180000),
            comment_count: expect.any(Number),
            comment_count: 0,
          });
        });
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET 200 - responds with an array of comments for the given article_id of which each comment should have the relevant properties", () => {
    return request(app)
      .get(`/api/articles/1/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(11);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  test("GET 200 - responds with the most recent comments first", () => {
    return request(app)
      .get(`/api/articles/1/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("GET 404 -- responds with approriate status and message, when the request has invalid article id number", () => {
    const articleId = 999;
    return request(app)
      .get(`/api/articles/${articleId}/comments`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
  test("GET 400 -- responds with approriate status and message, when the request has invalid article id type", () => {
    const articleId = "papers";
    return request(app)
      .get(`/api/articles/${articleId}/comments`)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("GET 200 - responds with an empty array when a valid article id is passed but with no associated comments", () => {
    return request(app)
      .get(`/api/articles/2/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBe(0);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST 201 - responds with the posted comment", () => {
    const articleId = 1;
    const body = {
      username: "butter_bridge",
      body: "Testing",
    };
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(body)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          body: expect.any(String),
          votes: expect.any(Number),
          author: expect.any(String),
          article_id: articleId,
          created_at: expect.any(String),
        });
      });
  });
  test("POST 400 - responds with an appropriate status message when missing valid comment fields", () => {
    const body = {
      username: "icellusedkars",
    };
    const articleId = 2;
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(body)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("POST 400 - responds with an appropriate status message when posting invalid comment fields", () => {
    const body = {
      username: 1,
      Body: "Testing",
    };
    const articleId = 2;
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(body)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("POST 400 - responds with an appropriate status message when posting with invalid article ID", () => {
    const body = {
      username: "icellusedkars",
      Body: "Testing",
    };
    const articleId = "Jeff";
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(body)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("POST 404 - responds with an appropriate status message when posting with valid but nonexistent article ID", () => {
    const body = {
      username: "butter_bridge",
      body: "Testing",
    };
    const articleId = 999;
    return request(app)
      .post(`/api/articles/${articleId}/comments`)
      .send(body)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH 200 - responds with updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.votes).toBe(99);
      });
  });
  test("PATCH 400 - responds with correct status and error message, when request has missing information", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("PATCH 400 - responds with correct status and error message, when request has wrong information", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "cat" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("PATCH 404 - responds with correct status and error message, when request has invalid id", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
  test("PATCH 400 - responds with correct status and error message, when request has invalid id type", () => {
    return request(app)
      .patch("/api/articles/cat")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE 204 - Deletes correct comment", () => {
    return request(app).delete("/api/comments/2").expect(204);
  });
  test("DELETE 404 - sends correct status and error message when ID is not found", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
  test("DELETE 400 - send correct status and error message when ID is invalid", () => {
    return request(app)
      .delete("/api/comments/cat")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("GET 200 - responds with an array of objects, each object with the relevant properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
          expect(users[0]).toEqual({
            username: "butter_bridge",
            name: "jonny",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          });
        });
      });
  });
  test("GET 404 - should return appropriate status and message for bad path", () => {
    return request(app)
      .get("/users")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Path Not Found");
      });
  });
});

describe("Bad Path Error", () => {
  test("GET 404 - should return appropriate status and message for bad path", () => {
    return request(app)
      .get("/topics")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Path Not Found");
      });
  });
});
