const jwt = require('jsonwebtoken');

// This function runs BEFORE protected routes
// It checks if the user has a valid token (like a bouncer)
const authMiddleware = (req, res, next) => {
  try {
    // Step 1: Get the token from the request header
    // Tokens are usually sent like: "Bearer eyJhbGc..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    // Step 2: Extract just the token (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // Step 3: Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach the user's ID to the request
    // Now any route using this middleware knows who is logged in
    req.userId = decoded.userId;

    // Step 5: Move on to the actual route
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;