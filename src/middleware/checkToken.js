const JWT = require("jsonwebtoken");

const checkToken = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(403).json({
      error: "You must login",
    });
  }

  try {
    let user = JWT.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = user.id;
    next();
  } catch (err) {
    return res.status(403).json({
      error: "You must login",
    });
  }
};

module.exports = checkToken;
