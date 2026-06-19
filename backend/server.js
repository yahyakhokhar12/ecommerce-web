const app = require('./app');

// Start server (local development)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ðŸš€ Server running on port ${PORT}`);
  console.log(`ðŸ“ Test route: http://localhost:${PORT}/api/test`);
  console.log(`ðŸ“ Products route: http://localhost:${PORT}/api/products`);
  console.log(`ðŸ”— Frontend URL: http://localhost:3000`);
});
