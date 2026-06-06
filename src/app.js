const express = require("express");
const todoRoutes = require("./routes/routes");
const { errorHandler } = require("./middleware/middleware");

const app = express();

app.use(express.json());
app.use("/api/todos", todoRoutes);
app.use(errorHandler);

module.exports = app;
