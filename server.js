// server.js
const express = require("express");
const ExpressError = require("./expressError");
const companiesRoutes = require("./routes/companies");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/companies", companiesRoutes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
