const express = require('express');
const router = express.Router();
const client = require('../database');
const auth = require('../middleware/auth');

// POST: Create a new project
router.post('/', auth, (req, res) => {
    const { name, description } = req.body;
    const owner_id = req.user.id;

    const query = `
        INSERT INTO projects (name, description, owner_id, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`;
    const values = [name, description, owner_id];

    client.query(query, values)
        .then(result => res.status(201).json(result.rows[0]))
        .catch(err => res.status(400).json({ error: err.message }));
});

// GET: Get all projects for the logged-in user
router.get('/users', auth, (req, res) => {
    const query = 'SELECT * FROM projects WHERE owner_id = $1';
    client.query(query, [req.user.id])
        .then(result => res.status(200).json(result.rows))
        .catch(err => res.status(400).json({ error: err.message }));
});

// GET: Get all projects (including those owned by other users)
router.get('/all', auth, (req, res) => {
    const query = 'SELECT * FROM projects';
    client.query(query)
        .then(result => res.status(200).json(result.rows))
        .catch(err => res.status(400).json({ error: err.message }));
});

// GET: Get a specific project by ID
router.get('/:id', auth, (req, res) => {
    const query = 'SELECT * FROM projects WHERE id = $1';
    client.query(query, [req.params.id])
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Project not found' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

// GET: Get a specific project with its tasks by project ID
router.get('/:id/tasks', auth, (req, res) => {
    const projectId = req.params.id;

    const projectQuery = `
        SELECT * FROM projects WHERE id = $1
    `;

    const tasksQuery = `
        SELECT * FROM tasks WHERE project_id = $1
    `;

    client.query(projectQuery, [projectId])
        .then(projectResult => {
            if (projectResult.rows.length > 0) {
                const project = projectResult.rows[0];

                client.query(tasksQuery, [projectId])
                    .then(tasksResult => {
                        project.tasks = tasksResult.rows;
                        res.status(200).json(project);
                    })
                    .catch(err => res.status(400).json({ error: err.message }));
            } else {
                res.status(404).json({ error: 'Project not found' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

// PUT: Update a project by ID
router.put('/:id', auth, (req, res) => {
    const { name, description } = req.body;

    const query = `
        UPDATE projects
        SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND owner_id = $4 RETURNING *`;
    const values = [name, description, req.params.id, req.user.id];

    client.query(query, values)
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Project not found or you are not the owner' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

// DELETE: Delete a project by ID
router.delete('/:id', auth, (req, res) => {
    const query = 'DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING *';
    client.query(query, [req.params.id, req.user.id])
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json({ message: 'Project deleted' });
            } else {
                res.status(404).json({ error: 'Project not found or you are not the owner' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = router;
