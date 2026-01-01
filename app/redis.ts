import { Redis } from "@upstash/redis";

const redis =
  process.env.SKIP_VIEWS === "1" || !process.env.UPSTASH_REDIS_REST_TOKEN
    ? null
    : new Redis({
        url: "https://credible-sunfish-10008.upstash.io",
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

export default redis;
