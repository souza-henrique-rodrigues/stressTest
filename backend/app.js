import express from "express";
import { Pool } from "pg";
const app = express();

const queryMoviesByLength = `
select
    film_id,
    title,
    length
from
    film
order by
    length desc;
`;

const queryMoviesInCategory = `
select
    category.name,
    count(category.name) category_count
from
    category
left join film_category on
    category.category_id = film_category.category_id
left join film on
    film_category.film_id = film.film_id
group by
    category.name
order by
    category_count desc;
`;

const connectionPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connectionPool
  .query("SELECT NOW()")
  .then(res => {
    console.log("DB connected:", res.rows[0]);
  })
  .catch(err => console.error("Connection error", err));

app.get("/home", (req, res) => {
  res.json({ data: "Home page" });
});

app.get("/movies", async (req, res) => {
  try {
    const result = await connectionPool.query(queryMoviesByLength);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/category", async (req, res) => {
  try {
    const result = await connectionPool.query(queryMoviesInCategory);
    return res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(8000, () => {
  console.log("Server running on port 8000 ...");
});
