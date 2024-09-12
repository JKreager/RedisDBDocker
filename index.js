const express = require('express');
const redis = require('redis');
const app = express();

// Create Redis client
const client = redis.createClient();

// Connect the Redis client explicitly (required in Redis v4)
(async () => {
  try {
    await client.connect(); // Connect to Redis server
    console.log('Connected to Redis...');
    
    // Initialize values in Redis after connection
    await client.set('header', 0);
    await client.set('left', 0);
    await client.set('article', 0);
    await client.set('right', 0);
    await client.set('footer', 0);
    console.log('Values initialized in Redis');
  } catch (err) {
    console.error('Error initializing Redis values:', err);
  }
})();

// Middleware to parse JSON
app.use(express.json());

// Implement data method using Promises
async function data() {
  try {
    const values = await client.mGet(['header', 'left', 'article', 'right', 'footer']);
    return {
      header: values[0],
      left: values[1],
      article: values[2],
      right: values[3],
      footer: values[4],
    };
  } catch (err) {
    throw err;
  }
}

// Endpoint to get data from Redis
app.get('/data', async (req, res) => {
  try {
    const result = await data();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to update a specific key-value pair
app.post('/update/:key/:value', async (req, res) => {
  const { key, value } = req.params;
  try {
    const exists = await client.exists(key);
    if (exists === 1) {
      await client.set(key, value);
      res.json({ message: `${key} updated successfully!`, value: value });
    } else {
      res.status(404).json({ error: `Key ${key} not found` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update value' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
