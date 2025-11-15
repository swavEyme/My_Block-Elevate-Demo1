// Example of the main service file using Express.js and Mongoose

const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis'); // For rate limiting
const app = express();
const port = 3001;

// --- 1. Database and Cache Configuration ---
// Connection strings from the Platform_Configs (PostgreSQL) are used here
mongoose.connect(process.env.MONGO_URI); 
const redisClient = redis.createClient({ url: process.env.REDIS_URL });

// Define the MongoDB Schema for user activity events
const EventSchema = new mongoose.Schema({
    user_id: { type: String, required: true, index: true },
    event_type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed // Flexible JSON payload
});
const ActivityEvent = mongoose.model('ActivityEvent', EventSchema);

// --- 2. Middleware for Rate Limiting (using Redis) ---
const rateLimitMiddleware = async (req, res, next) => {
    const userId = req.headers['x-user-id']; // Assumed to be passed by the API Gateway
    const key = `rate_limit:${userId}`;
    
    // Check limit (e.g., 100 requests per minute)
    const requests = await redisClient.incr(key);
    if (requests === 1) {
        // Set expiry for the key after 60 seconds
        await redisClient.expire(key, 60); 
    }

    if (requests > 100) {
        return res.status(429).send('Rate limit exceeded');
    }
    next();
};

app.use(express.json());
app.use(rateLimitMiddleware);

// --- 3. Core API Endpoint ---
// Endpoint for tracking a new event
app.post('/v1/events/track', async (req, res) => {
    try {
        const { user_id, event_type, details } = req.body;

        const newEvent = new ActivityEvent({
            user_id: user_id,
            event_type: event_type,
            details: details
        });

        // Save the event to MongoDB
        await newEvent.save(); 
        
        // Log to console for observability
        console.log(`Tracked event: ${event_type} for user ${user_id}`);

        res.status(201).json({ status: 'tracked', id: newEvent._id });

    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ message: 'Failed to track event' });
    }
});

app.listen(port, () => {
    console.log(`Behavioral Data Service listening on port ${port}`);
});