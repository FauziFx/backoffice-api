const pool = require("../db/connect.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Login Process
const login = async (req, res, next) => {
  try {
    // Get user input
    const { username, password } = req.body;

    // Validate user input
    if (!(username && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const [user] = await pool.query(
      "SELECT * FROM tbl_user WHERE username = ?",
      [username]
    );

    if (!user[0]) {
      res.json({
        succes: false,
        message: "Username tidak tersedia",
      });
    } else {
      // compare Password if user exist
      bcrypt.compare(password, user[0].password, function (err, result) {
        if (err) next(err);

        if (!result) {
          res.json({
            succes: false,
            message: "Password salah",
          });
        } else {
          // Create token
          const token = jwt.sign(
            {
              user: {
                id: user[0].id,
                nama: user[0].nama,
                username: user[0].username,
                role: user[0].role,
              },
            },
            process.env.SECRET_KEY,
            {
              expiresIn: "7 days",
              // expiresIn: "2h",
            }
          );

          // response
          res.status(200).json({
            success: true,
            token: token,
          });
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// Auth Token
const authToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];

  // Validate if token exist
  if (!token) {
    return res.status(403).send({
      success: false,
      message: "token tidak tersedia",
    });
  } else {
    // Verify token if token exist
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.decoded = decoded;
    } catch (err) {
      return res.json({
        success: false,
        message: "invalid token",
      });
    }
    return next();
  }
};

exports.login = login;
exports.authToken = authToken;
