const express = require('express');
const router = express.Router();
const client = require('../database');
const auth = require('../middleware/auth');

// POST: Create a new task
router.post('/', auth, (req, res) => {
    const { title, description, status, due_date, project_id } = req.body;
    const assigned_to = req.user.id; // Default: pengguna yang sedang login

    const query = `
        INSERT INTO tasks (title, description, status, due_date, project_id, assigned_to, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`;
    const values = [title, description, status, due_date, project_id, assigned_to];

    client.query(query, values)
        .then(result => res.status(201).json(result.rows[0]))
        .catch(err => res.status(400).json({ error: err.message }));
});

// GET: Get all tasks for the logged-in user
router.get('/users', auth, (req, res) => {
    const query = 'SELECT * FROM tasks WHERE assigned_to = $1';
    client.query(query, [req.user.id])
        .then(result => res.status(200).json(result.rows))
        .catch(err => res.status(400).json({ error: err.message }));
});

// GET: Get all tasks (including those assigned to other users)
router.get('/all', auth, (req, res) => {
    const query = 'SELECT * FROM tasks';
    client.query(query)
        .then(result => res.status(200).json(result.rows))
        .catch(err => res.status(400).json({ error: err.message }));
});

// GET: Get a specific task by ID
router.get('/:id', auth, (req, res) => {
    const query = 'SELECT * FROM tasks WHERE id = $1 AND assigned_to = $2';
    client.query(query, [req.params.id, req.user.id])
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Task not found or you are not the assigned user' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

// PUT: Update a task by ID (including reassigning to another user)
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { title, description, status, due_date, project_id, assigned_to } = req.body;

    try {
        // Ambil data tugas yang ada dari database
        const taskQuery = 'SELECT * FROM tasks WHERE id = $1';
        const taskResult = await client.query(taskQuery, [id]);

        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = taskResult.rows[0];

        // Gunakan nilai yang ada jika tidak diberikan dalam request
        const updatedTitle = title !== undefined ? title : task.title;
        const updatedDescription = description !== undefined ? description : task.description;
        const updatedStatus = status !== undefined ? status : task.status;
        const updatedDueDate = due_date !== undefined ? due_date : task.due_date;
        const updatedProjectId = project_id !== undefined ? project_id : task.project_id;
        const updatedAssignedTo = assigned_to !== undefined ? assigned_to : task.assigned_to;

        // Update task dengan nilai yang baru atau yang sudah ada
        const updateQuery = `
            UPDATE tasks
            SET title = $1, description = $2, status = $3, due_date = $4, project_id = $5, assigned_to = $6, updated_at = CURRENT_TIMESTAMP
            WHERE id = $7 RETURNING *`;
        const values = [updatedTitle, updatedDescription, updatedStatus, updatedDueDate, updatedProjectId, updatedAssignedTo, id];

        const updateResult = await client.query(updateQuery, values);

        res.status(200).json(updateResult.rows[0]);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// DELETE: Delete a task by ID
router.delete('/:id', auth, (req, res) => {
    const query = 'DELETE FROM tasks WHERE id = $1 AND assigned_to = $2 RETURNING *';
    client.query(query, [req.params.id, req.user.id])
        .then(result => {
            if (result.rows.length > 0) {
                res.status(200).json({ message: 'Task deleted' });
            } else {
                res.status(404).json({ error: 'Task not found or you are not authorized to delete it' });
            }
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = router;
