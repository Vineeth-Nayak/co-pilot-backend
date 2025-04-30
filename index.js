// create a simple express server with cors, mongoose
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// import routes
const authorRoutes = require('./routes/authorRoutes');
const articleRoutes = require('./routes/articleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/auth');

// import db connection
const connectDB = require('./utils/db');

const app = express();
dotenv.config();

// Middleware
// allow cors for localhost:3000 and localhost:5000
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
const corsOptions = {
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
};
app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json()); // Parse JSON bodies

// MongoDB connection
connectDB(process.env.MONGODB_URI)

// Routes
app.use('/api/authors', authorRoutes);  // Author routes
app.use('/api/articles', articleRoutes); // Article routes  
app.use('/api/categories', categoryRoutes); // Category routes
app.use('/api/auth', authRoutes); // Auth routes


// Define PORT and start the server to that specified port
const PORT = process.env.PORT || 5000;  // Default port is 5000


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});