// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;
// const cors = require('cors');

// app.use(express.json());


// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/user-auth', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => console.log('MongoDB connected'))
//     .catch((err) => console.log(err));

// // User Schema
// const userSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
// });

// const User = mongoose.model('User', userSchema);

// // Signup Route
// app.post('/signup', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new User({
//             email,
//             password: hashedPassword,
//         });

//         await newUser.save();
//         res.status(201).json({ message: 'User created successfully!' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // Login Route
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: 'User not found' });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//             expiresIn: '1h',
//         });

//         res.status(200).json({ token });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');


// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend origin
    methods: ['GET', 'POST'], // Allowed methods
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/user-auth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

async function fetchChatbotResponse(userMessage) {
    const response = await axios.post('http://127.0.0.1:8000/chat', {
        message: userMessage
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.CHATBOT_API_KEY}`
        }
    });
    return response.data;
}


// Signup Route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save new user
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // Check password match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

