const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

// mongoose.connect("mongodb://localhost/budget", {
//   useNewUrlParser: true,
//   useFindAndModify: false,
// });

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost/budget";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// routes
app.use(require("./routes/api.js"));

// app.listen(PORT, () => {
//   console.log(`App running on port ${PORT}!`);
// });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  // Starting our Express app
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
  });
});
