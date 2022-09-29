const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    const error = new Error('Unauthorized access!');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
  }

  if (!decodedToken) throw new Error('Something went wrong');

  req.userId = decodedToken.userId;

  next();
};
module.exports = isAuth;
