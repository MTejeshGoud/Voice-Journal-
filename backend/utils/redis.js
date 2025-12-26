import Redis from "ioredis";

export const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    db: 0,          // DB 0 for job queue
});

redis.on("connect", () => {
    console.log("Redis connected successfully");
});

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});