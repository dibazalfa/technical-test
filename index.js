require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
