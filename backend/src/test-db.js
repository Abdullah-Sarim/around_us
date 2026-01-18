require("dotenv/config");
const { Client } = require("pg");

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await client.connect();
    console.log("jjDatabase connected successfully");
    await client.end();
  } catch (err) {
    console.error("Database connection failed");
    console.error("ERROR MESSAGE:", err.message);
    console.error("ERROR CODE:", err.code);
    console.error("FULL ERROR:", err);
  }
})();
