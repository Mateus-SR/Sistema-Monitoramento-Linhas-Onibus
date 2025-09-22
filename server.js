const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.get('/home', (req, res) => {
  res.status(200).json('Welcome, your app is working well');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;