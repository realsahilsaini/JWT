const jwt = require("jsonwebtoken");
const JWT_SECRET = "yoursecretkey";

function authMiddleware(req, res, next) {
  //Get the token from the headers from Todoscript
  const token = req.headers.token;

  const decodedData = jwt.verify(token, JWT_SECRET);

  if (decodedData) {
    req.userId = decodedData.id;
    next();
  } else {
    res.status(400).send("Invalid token");
  }
}

module.exports =  {
  authMiddleware,
  JWT_SECRET
}