const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');



/*
REGISTER ROUTE
URL: POST /api/auth/register
What it does: Creates a new user account
*/
router.post('/register', async (req, res) => {
  console.log('📦 Received body:', req.body);
  console.log('🔑 Password received:', req.body.password);
    try {
        // step 1: Get the data that user sent
        const { name, email, password } = req.body;
        console.log('🔍 AFTER destructuring:');
console.log('Name:', name);
console.log('Email:', email);
console.log('Password:', password);
console.log('Password length:', password ? password.length : 'undefined');

        // step 2: Check all fields are pprovided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // step 3: Check if email already exists in database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered'});
        }

        // step 4: Hash the password
        // the "10" means how many  times to scramble - higher = more secure but slower
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // step 5: Create and save the new user
console.log('🧪 About to create user with:');
console.log('Name:', name);
console.log('Email:', email);
console.log('Hashed Password:', hashedPassword);
console.log('Hashed Password length:', hashedPassword.length);
        const newUser = new User({
            name,
            email,
            password: hashedPassword   // Savee scrambled password, NOT the real one
        });
        await newUser.save();

        // Step 6: Create a JWT token for the user
    const token = jwt.sign(
      { userId: newUser._id },          // What we store in the token
      process.env.JWT_SECRET,           // Secret key to sign the token
      { expiresIn: '7d' }               // Token expires in 7 days
    );

    // Step 7: Send success response
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again'});
}
});


/*
LOGIN ROUTE
URL: POST /api/auth/login
What it does: Logs in an existing user
*/

router.post('/login', async (req, res) => {
  try {
    // Step 1: Get email and password from request
    const { email, password } = req.body;

    // Step 2: Check fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Step 3: Find user by email in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Step 4: Compare entered password with stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Step 5: Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Step 6: Send success response with token
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

module.exports = router;
