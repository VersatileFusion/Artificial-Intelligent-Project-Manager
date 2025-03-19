// Import dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

console.log('Starting AI Project Manager server...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log('Swagger documentation available at /api-docs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const aiRoutes = require('./routes/ai');

// Routes
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  console.log('Root endpoint called');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Get API information
 *     description: Returns information about the API and available endpoints
 *     responses:
 *       200:
 *         description: API information
 */
app.get('/api', (req, res) => {
  console.log('API information endpoint called');
  res.json({
    message: 'AI Project Manager API',
    version: '1.0.0',
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'Health check endpoint' },
      { path: '/api/projects', method: 'GET', description: 'Get all projects' },
      { path: '/api/tasks', method: 'GET', description: 'Get all tasks' },
      { path: '/api/users', method: 'GET', description: 'Get all users' },
      { path: '/api/ai/tasks/suggest/:projectId', method: 'GET', description: 'Get AI-suggested tasks' },
      { path: '/api/ai/tasks/duration/:taskId', method: 'GET', description: 'Predict task duration' },
      { path: '/api/ai/projects/timeline/:projectId', method: 'GET', description: 'Predict project timeline' },
      { path: '/api/ai/projects/optimize/:projectId', method: 'GET', description: 'Optimize project workflow' }
    ]
  });
});

// Import models
const Project = require('./models/project');
const Task = require('./models/task');
const User = require('./models/user');

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve a list of all projects
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
app.get('/api/projects', async (req, res) => {
  console.log('Get all projects endpoint called');
  try {
    const projects = await Project.find();
    console.log(`Returning ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Create a new project with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid request data
 */
app.post('/api/projects', async (req, res) => {
  console.log('Create project endpoint called');
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    console.log(`Project created with ID: ${savedProject._id}`);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Retrieve a project by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 */
app.get('/api/projects/:id', async (req, res) => {
  console.log(`Get project endpoint called for ID: ${req.params.id}`);
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      console.log(`Project not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Project not found' });
    }
    console.log(`Returning project: ${project.name}`);
    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a list of all tasks
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
app.get('/api/tasks', async (req, res) => {
  console.log('Get all tasks endpoint called');
  try {
    const tasks = await Task.find();
    console.log(`Returning ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid request data
 */
app.post('/api/tasks', async (req, res) => {
  console.log('Create task endpoint called');
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    console.log(`Task created with ID: ${savedTask._id}`);
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Retrieve a task by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
app.get('/api/tasks/:id', async (req, res) => {
  console.log(`Get task endpoint called for ID: ${req.params.id}`);
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log(`Task not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Task not found' });
    }
    console.log(`Returning task: ${task.title}`);
    res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/projects/{id}/tasks:
 *   get:
 *     summary: Get tasks for a project
 *     description: Retrieve all tasks for a specific project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of tasks for the project
 *       500:
 *         description: Server error
 */
app.get('/api/projects/:id/tasks', async (req, res) => {
  console.log(`Get tasks for project endpoint called for project ID: ${req.params.id}`);
  try {
    const tasks = await Task.find({ project: req.params.id });
    console.log(`Returning ${tasks.length} tasks for project ${req.params.id}`);
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks for project:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/api/users', async (req, res) => {
  console.log('Get all users endpoint called');
  try {
    const users = await User.find().select('-password');
    console.log(`Returning ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request data
 */
app.post('/api/users', async (req, res) => {
  console.log('Create user endpoint called');
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    console.log(`User created with ID: ${savedUser._id}`);
    res.status(201).json({ ...savedUser.toJSON(), password: undefined });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
});

// Mount AI routes
app.use('/api/ai', aiRoutes);
console.log('AI routes mounted at /api/ai');

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
});

module.exports = app; 