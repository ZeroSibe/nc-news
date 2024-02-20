const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");

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
      });
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
