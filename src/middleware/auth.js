const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // No Authorization header → allow request
    if (!authHeader) {
      req.user = null;
      return next();
    }

    // Expect format: Bearer <token>
    if (!authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    // No token after Bearer
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    return next();
  } catch (error) {
    // Any error → treat as unauthenticated, but DO NOT block
    req.user = null;
    return next();
  }
}

module.exports = auth;
