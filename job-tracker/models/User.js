//console.log('User schema loaded successfully');
const mongoose = require ('mongoose');

// This is the blueprint for every user stored in the database
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,   // Must be provided
        trim: true,       // Remove extra spaces
    },
    email: {
        type: String,
        required: true,
        unique: true,     // No two users can have same email
        lowercase: true   // Always stored in lowercase
    },
    password: {
        type: String,
        required: true,
        minLength: 6      // Password must be at least 6 characters
    },
    createdAt: {
        type: Date,
        default: Date.now   // Automatically saves when user registered
    }
});

module.exports = mongoose.model('User', UserSchema);