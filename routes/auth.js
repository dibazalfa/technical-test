const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const client = require('../database');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const JWT_SECRET = process.env.JWT_SECRET;

// REGISTER
router.post('/register', upload.single('avatar'), async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const avatarPath = req.file ? req.file.path : null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO users (firstname, lastname, email, password, avatar, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`;
    const values = [firstname, lastname, email, hashedPassword, avatarPath];

    client.query(query, values)
        .then(result => res.status(201).json(result.rows[0]))
        .catch(err => res.status(400).json({ error: err.message }));
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = $1';
    client.query(query, [email])
        .then(async result => {
            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = router;
