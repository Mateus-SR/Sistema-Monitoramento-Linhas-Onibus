// Use "type: commonjs" in package.json to use CommonJS modules
const express = require('express');
const app = express();

const tolkien = process.env.tolkien;

// Define your routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});
 
// Export the Express app
module.exports = app;