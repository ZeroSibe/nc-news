const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
  test("GET 200 - responds with an object describing all the avalable endpoints on your API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
        expect(endpoints).toHaveProperty("GET /api/topics");
        expect(endpoints).toHaveProperty("GET /api");
      });
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
