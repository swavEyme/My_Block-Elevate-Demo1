// MongoDB Models
const mongoose = require('mongoose');

// User Activity Events (from your existing structure)
const EventSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  event_type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed,
  platform_source: String,
  session_id: String,
  page_url: String,
  related_id: String
});

// Wellness Data Tracking
const WellnessSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  mood_score: { type: Number, min: 1, max: 10 },
  sleep_hours: Number,
  exercise_minutes: Number,
  meditation_minutes: Number,
  stress_level: { type: Number, min: 1, max: 10 },
  notes: String,
  created_at: { type: Date, default: Date.now }
});

// Social Media Posts Cache
const SocialPostSchema = new mongoose.Schema({
  post_id: String,
  user_id: { type: String, required: true, index: true },
  platform: { type: String, required: true }, // 'internal', 'facebook', 'twitter', etc.
  content: { type: String, required: true },
  media_urls: [String],
  engagement: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  external_id: String, // ID from external platform
  sync_status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

// External Platform Sync Status
const SyncStatusSchema = new mongoose.Schema({
  platform_name: { type: String, required: true },
  last_sync: { type: Date, required: true },
  sync_type: { type: String, required: true }, // 'full', 'incremental'
  status: { type: String, required: true }, // 'success', 'failed', 'in_progress'
  records_processed: Number,
  error_message: String,
  next_sync: Date
});

// Create indexes for better performance
EventSchema.index({ user_id: 1, timestamp: -1 });
EventSchema.index({ event_type: 1, timestamp: -1 });
WellnessSchema.index({ user_id: 1, date: -1 });
SocialPostSchema.index({ user_id: 1, created_at: -1 });
SocialPostSchema.index({ platform: 1, sync_status: 1 });

const ActivityEvent = mongoose.model('ActivityEvent', EventSchema);
const WellnessData = mongoose.model('WellnessData', WellnessSchema);
const SocialPost = mongoose.model('SocialPost', SocialPostSchema);
const SyncStatus = mongoose.model('SyncStatus', SyncStatusSchema);

module.exports = {
  ActivityEvent,
  WellnessData,
  SocialPost,
  SyncStatus
};