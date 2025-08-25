// src/test-redis.js
const redisClient = require('./utils/redisClient');

(async () => {
  try {
    // Set a key
    await redisClient.set('finpay:test', 'Hello from Redis Cloud!');

    // Get it back
    const value = await redisClient.get('finpay:test');
    console.log('🎉 Retrieved from Redis:', value);

    // Optional: Delete it
    await redisClient.del('finpay:test');

    // Close connection gracefully
    await redisClient.quit();
  } catch (err) {
    console.error('Test failed:', err.message);
  }
})();