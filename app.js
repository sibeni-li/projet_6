// Imports
const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');

// Create Express application
const app = express();

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${process.env.BDDLOGIN}:${process.env.BDDPASSWORD}@cluster0.tjk7oxw.mongodb.net/vieux-grimoir?retryWrites=true&w=majority&appName=Cluster0` , 
    {   useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion `MongoDB échouée !'));

// Middleware to parse JSON bodies
app.use(express.json());

//CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Set up routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;