const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const errorHandlers = require("./middlewares/errorHandler.js");
const router = require("./router/router");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/api");
});

app.use("/api", router);

app.use(errorHandlers);

app.listen(port, () =>
  console.log("Server running at http://localhost:" + port)
);
