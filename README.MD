# Redis

Redis is an in-memory data structure store used as a database, cache, and message broker. It supports various data structures and offers high performance, rich feature set, and atomic operations.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Common Data Structures](#common-data-structures)

   * [Strings](#strings)
   * [Lists](#lists)
   * [Sets](#sets)
   * [Hashes](#hashes)
   * [Sorted Sets](#sorted-sets)
   * [Streams](#streams)
   * [Geospatial](#geospatial)
5. [Pub/Sub (Publish–Subscribe)](#pubsub)
6. [Resources](#resources)
7. [Redis Insights](#redis-insights)

## Introduction

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store that can be used as a database, cache, and message broker. It provides built-in replication, Lua scripting, LRU eviction, transactions, and different levels of on-disk persistence.

## Installation

**macOS (Homebrew)**

```bash
brew update
brew install redis
brew services start redis
```

**Linux (APT)**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server.service
sudo systemctl start redis-server.service
```

**Windows** Follow instructions at [https://redis.io/docs/getting-started/installation/](https://redis.io/docs/getting-started/installation/)

## Getting Started

Once installed, start the Redis CLI:

```bash
redis-cli
```

You should see a prompt:

```
127.0.0.1:6379>
```

You can now run commands directly against your Redis server.

## Common Data Structures

### Strings

The simplest Redis type: a key-value pair where the value is a binary-safe string.
**Use cases:** Caching HTML fragments, counters, tokens.

```bash
# Set and get a string
SET user:1001:name "Alice"
GET user:1001:name
```

### Lists

Lists are simple lists of strings, sorted by insertion order.
**Use cases:** Implement stacks (LIFO) and queues (FIFO), background job queues.

```bash
# Push items to a queue and pop
LPUSH tasks "task1"
RPUSH tasks "task2"
LPOP tasks   # Pops from left (FIFO)
RPOP tasks   # Pops from right (LIFO)
```

### Sets

Unordered collections of unique strings.
**Use cases:** Track unique items, user-role mappings, set operations.

```bash
# Add members and retrieve set
SADD online:users user1 user2
SMEMBERS online:users
# Intersection example
SADD role:admin user1 user3
SINTER online:users role:admin
```

### Hashes

Hash maps between string fields and values. Ideal to represent objects.
**Use cases:** Store user objects, counters, grouped data.

```bash
# Create and read a hash
HSET user:1001 id 1001 name "Alice" age 30
HGETALL user:1001
```

### Sorted Sets

Similar to Sets but with a score for ordering.
**Use cases:** Leaderboards, priority queues, rate limiting.

```bash
# Add elements with scores and get range
ZADD leaderboard 1500 "player1" 2000 "player2"
ZRANGE leaderboard 0 -1 WITHSCORES
```

### Streams

A log data structure for storing multiple fields with IDs.
**Use cases:** Event sourcing, sensor data, notification feeds.

```bash
# Add and read from a stream
XADD events * user_id 1001 action "login"
XREAD COUNT 10 STREAMS events 0
```

### Geospatial

Store latitude, longitude, and perform radius queries.
**Use cases:** Find nearby users, location-based services.

```bash
# Add and query geo data
GEOADD cities 13.361389 38.115556 "Palermo"
GEORADIUS cities 15 37 200 km
```

## Pub/Sub (Publish–Subscribe)

Redis Pub/Sub allows message broadcasting to multiple subscribers.
**Use cases:** Real-time chat, live updates, analytics dashboards.

```bash
# In one terminal, subscribe to a channel
SUBSCRIBE notifications
# In another terminal, publish a message
PUBLISH notifications "New user signed up"
```

## Resources

* Official docs: [https://redis.io/documentation](https://redis.io/documentation)
* Tutorials: [https://redis.io/topics/tutorial](https://redis.io/topics/tutorial)
* Community: [https://redis.io/community](https://redis.io/community)

## Redis Insights

Redis Insights (formerly RedisInsight) is a graphical tool provided by Redis to help you visualize and monitor your Redis instances. It offers real-time and historical data on performance, memory usage, and command statistics.

**Key Features:**

* **Dashboard:** View memory consumption, CPU load, and throughput at a glance.
* **CLI Browser:** Run Redis commands directly from the GUI with auto-completion.
* **Slow Log Viewer:** Identify slow-running commands using the Slow Log.
* **Memory Analysis:** Explore memory usage per key and overall dataset footprint.
* **JSON and Streams Explorer:** Navigate complex data types like JSON documents and Streams.

**Usage:**

1. **Install Redis Insights**

   * **Docker:**

     ```bash
     docker run -d -p 8001:8001 --name redisinsight redislabs/redisinsight:latest
     ```
   * **Binary:** Download from [https://redis.io/redisinsight](https://redis.io/redisinsight) and run the installer.

2. **Connect to Redis Instance**

   * Open Redis Insights at `http://localhost:8001`.
   * Click **Add Redis Database**, enter hostname, port, and credentials if needed.

3. **Monitor and Analyze**

   * Use the **Dashboard** to track performance metrics.
   * Open **CLI Browser** to execute commands.
   * View **Slow Log** to optimize slow operations.

**Example Commands for Insights:**

```bash
# Get server information and statistics
INFO

# Retrieve the latest 10 slow log entries
SLOWLOG GET 10
```
