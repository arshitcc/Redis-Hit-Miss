import express from "express";
import axios from "axios";
import Redis from "ioredis";
import rateLimit from "express-rate-limit";

const app = express();
const redis = new Redis();

const client = axios.create({
  baseURL: "https://api.freeapi.app/api/v1/public",
});

const PORT = process.env.PORT ?? 3000;

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 10,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     // use handler ApiResponse / ApiError
//     message: "Wait Baby",
//   },
// });

// app.use(limiter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", async (req, res) => {
  try {
    const { page } = req.query;
    let pageNum = Number(page) ?? 1;

    const totalRequests = await redis.get(
      `totalCartPrice:${req.headers["user-agent"]}:${pageNum}`
    );

    console.log(
      `Total Request for ${req.headers["user-agent"]} is ${totalRequests ?? 0}`
    );

    if (totalRequests && Number(totalRequests) >= 10) {
      res.status(429).send({ message: "Wait Baby" });
      return;
    }

    const catchedPrice = await redis.get(`totalCartPrice:${pageNum}`);
    if (catchedPrice) {
      console.log("Cache HIT");
      await redis.incr(
        `totalCartPrice:${req.headers["user-agent"]}:${pageNum}`
      );
      res.send({ totalCartPrice: catchedPrice });
      return;
    }

    const response = await client.get(`/randomproducts?page=${pageNum}`);

    const cartItems = response.data.data.data;
    const totalCartPrice = cartItems.reduce(
      (acc: number, item: { price: number }) => item?.price ?? 0,
      0
    );

    console.log("Cache MISS");
    await redis.set(`totalCartPrice:${pageNum}`, totalCartPrice);
    await redis.set(
      `totalCartPrice:${req.headers["user-agent"]}:${pageNum}`,
      1
    );
    await redis.expire(
      `totalCartPrice:${req.headers["user-agent"]}:${pageNum}`,
      60
    );

    res.send({ totalCartPrice });
  } catch (error) {
    console.log(error);
  }
});

app.get("/quotes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const cachedQuote = await redis.get(`quotes:${id}`);
    if (cachedQuote) {
      console.log("Cache HIT");
      res.send({ content: cachedQuote });
      return;
    }

    console.log("Cache MISS");
    const response = await client.get(`/quotes/${id}`);
    const quote = response.data.data.content;
    await redis.set(`quotes:${id}`, quote);
    await redis.expire(`quotes:${id}`, 10);

    res.send({ content: quote });
  } catch (error) {
    console.log(error);
  }
});

app.get("/meals/:id", async (req, res) => {
  const { id } = req.params;

  const response = await client.get(`/meals/${id}`);
  const meal = response.data.data.strMeal;
  await redis.lpush("meals_order", JSON.stringify({}));
  res.json({ meal });
});

app.get("/orders/:id", async (req, res) => {
  // const { id } = req.params;
  // await redis.lpush("orders", id);
  // await redis.lpush("orders", id + 1);
  // await redis.lpush("orders", id + 2);
  // await redis.lpush("orders", id + 3);

  const completedOrder = await redis.blpop("orders", 30); // blocking-mode

  // add data from cli

  res.json({ message: "Order Completed", order: completedOrder });
});

// redis-streams <-----> Kafka


/*
  PUBLISH-SUBSCRIBE -----> redis, (
  This helps in real-time data processing and analytics with Redis. 
  It is mostly used with websockets. 
  Redis streams are a real-time messaging system that allows you to build fast and reliable messaging systems for web applications and services.)
*/

/* 

redis-insights  : localhost:8001

*/

/* 

  Short Summary: 

  common data structues :
   STRING,

   LIST(
   frequently used to:
    1. Implement stacks and queues.
    2. Build queue management for background worker systems.
    ), 
  
   SET (
   use Redis sets to efficiently:
    1. Track unique items (e.g., track all unique IP addresses accessing a given blog post).
    2. Represent relations (e.g., the set of all users with a given role).
    3. Perform common set operations such as intersection, unions, and differences.
   ), 

   HASHMAPS (use hashes to represent basic objects and to store groupings of counters, among other things.), 

   SORTED SETS (priority queue) : 
    use cases for sorted sets include:
    1. Leaderboards. For example, you can use sorted sets to easily maintain ordered lists of the highest scores in a massive online game.
    2. Rate limiters. In particular, you can use a sorted set to build a sliding-window rate limiter to prevent excessive API requests., 

   STREAMS (fast throughput) (alternative like kafka) : 
    Examples of Redis stream use cases include:
    1. Event sourcing (e.g., tracking user actions, clicks, etc.)
    2. Sensor monitoring (e.g., readings from devices in the field)
    3. Notifications (e.g., storing a record of each user's notifications in a separate stream), 

   GeoSpatial (his data structure is useful for finding nearby points within a given radius or bounding box.)
*/
