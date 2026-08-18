const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Prijava je obavezna." });
  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return res.status(401).json({ message: "Prijava je istekla." });
    req.user = user;
    return next();
  });
}

module.exports = verifyToken;
