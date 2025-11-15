const express = require('express');
const path = require('path');

const router = express.Router();

// Serve static files
router.use('/public', express.static(path.join(__dirname, '../../../public')));
router.use('/chatbot', express.static(path.join(__dirname, '../../../chatbot')));

// Serve main HTML file
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../index.html'));
});

module.exports = router;