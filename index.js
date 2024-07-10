const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });