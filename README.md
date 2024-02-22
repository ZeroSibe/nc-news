# News API

I have built a news API using Node.js and Express, the backend is PSQL.

You can find the hosted version of the API here https://nc-news-izio.onrender.com/api/

## Project Set-Up:

To run this project locally, you can clone this project and run in your own enviroment.

1. Clone this repo in your own dev enviroment

- In your terminal `git clone https://github.com/ZeroSibe/nc-news.git `

2. In your terminal run `npm install` - to install all the dependencies.
3. This project requires two `.env` files

- create your enviroment variables in a `.env.test` and `.env.development` file

- into each file add the database name `PGDATABASE = <database_name_here>`

4. To create and seed your local databases, run the scripts `npm run setup-dbs` in your terminal, and then run `npm run seed`
5. Testing

- you can run all the test suites, run the script `npm run test` in your terminal to check

6. To run the server with the development data, in your terminal run `npm run start`

- you'll be listening on port `9090`

This project is running on:

- Node version 20.9.0
- Postgres version 8.7.3

### Available Endpoints

---

#### **GET /api**

responds with JSON listing all the available endpoints

#### **GET /api/topics**

responds with a list of topics

#### **GET /api/articles**

responds with a list of articles

#### **GET /api/users**

responds with a list of users

#### **GET /api/articles (queries)**

allows articles to be filtered and sorted

#### **GET /api/articles/:article_id**

responds with a single article by article_id

#### **GET /api/articles/:article_id (comment count)**

adds a comment count to the response when retrieving a single article

#### **GET /api/articles/:article_id/comments**

responds with a list of comments by article_id

#### **POST /api/articles/:article_id/comments**

add a comment by article_id

#### **PATCH /api/articles/:article_id**

updates an article by article_id

#### **DELETE /api/comments/:comment_id**

deletes a comment by comment_id
