const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const client = require('../database');
const auth = require('../middleware/auth');

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

// GET: get current user
router.get('/', auth, (req, res) => {
    const { id } = req.user;
    const query = 'SELECT * FROM users WHERE id = $1';

    client.query(query, [id])
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

// UPDATE: update current user
router.put('/', auth, upload.single('avatar'), async (req, res) => {
    const { id } = req.user;

    // Dapatkan informasi pengguna saat ini dari database
    const getUserQuery = 'SELECT * FROM users WHERE id = $1';
    const currentUser = await client.query(getUserQuery, [id]);

    if (currentUser.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = currentUser.rows[0];

    const firstname = req.body.firstname || user.firstname;
    const lastname = req.body.lastname || user.lastname;
    const email = req.body.email || user.email;
    const password = req.body.password || user.password;
    const avatarPath = req.file ? req.file.path : user.avatar;

    const query = `
        UPDATE users
        SET firstname = $1, lastname = $2, email = $3, password = $4, avatar = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 RETURNING *`;
    const values = [firstname, lastname, email, password, avatarPath, id];

    client.query(query, values)
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

// DELETE: delete current user
router.delete('/', auth, (req, res) => {
    const { id } = req.user;
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';

    client.query(query, [id])
        .then(result => {
            if (result.rows.length > 0) {
                if (result.rows[0].avatar) {
                    fs.unlink(result.rows[0].avatar, (err) => {
                        if (err) {
                            console.error('Failed to delete local image:', err);
                        }
                    });
                }
                res.status(200).json({ message: 'User deleted' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = router;
