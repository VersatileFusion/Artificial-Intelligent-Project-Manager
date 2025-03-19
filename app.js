// Import dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
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

// Security middlewares
app.use(helmet()); // Set security headers

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import rate limiters
const { apiLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');

// Apply rate limiting to API routes
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log('Swagger documentation available at /api-docs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

// Mount routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
console.log('AI routes mounted at /api/ai');
console.log('Auth routes mounted at /api/auth');

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
      { path: '/api/ai/projects/optimize/:projectId', method: 'GET', description: 'Optimize project workflow' },
      { path: '/api/auth/register', method: 'POST', description: 'Register a new user' },
      { path: '/api/auth/login', method: 'POST', description: 'Login user' },
      { path: '/api/auth/me', method: 'GET', description: 'Get current user information' }
    ]
  });
});

// Import models
const Project = require('./models/project');
const Task = require('./models/task');
const User = require('./models/user');

// Import middleware
const { protect, authorize } = require('./middleware/auth');
const { projectValidationRules, taskValidationRules, validateRequest } = require('./middleware/validation');

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve a list of all projects
 *     security:
 *       - bearerAuth: []
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
app.get('/api/projects', protect, async (req, res, next) => {
  console.log('Get all projects endpoint called');
  try {
    let query = {};
    
    // If user is not admin, only show their projects
    if (req.user.role !== 'admin') {
      query = { 
        $or: [
          { owner: req.user._id },
          { members: req.user._id }
        ]
      };
    }
    
    const projects = await Project.find(query);
    console.log(`Returning ${projects.length} projects`);
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Create a new project with the provided data
 *     security:
 *       - bearerAuth: []
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
app.post('/api/projects', protect, projectValidationRules, validateRequest, async (req, res, next) => {
  console.log('Create project endpoint called');
  try {
    // Add owner to project
    req.body.owner = req.user._id;
    
    const project = new Project(req.body);
    const savedProject = await project.save();
    console.log(`Project created with ID: ${savedProject._id}`);
    res.status(201).json({
      success: true,
      data: savedProject
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Retrieve a project by its ID
 *     security:
 *       - bearerAuth: []
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
app.get('/api/projects/:id', protect, async (req, res, next) => {
  console.log(`Get project endpoint called for ID: ${req.params.id}`);
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      console.log(`Project not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    // Check if user has access to this project
    if (req.user.role !== 'admin' && 
        project.owner.toString() !== req.user._id.toString() && 
        !project.members.includes(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this project' 
      });
    }
    
    console.log(`Returning project: ${project.name}`);
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve a list of all tasks
 *     security:
 *       - bearerAuth: []
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
app.get('/api/tasks', protect, async (req, res, next) => {
  console.log('Get all tasks endpoint called');
  try {
    let query = {};
    
    // If user is not admin, only show tasks they created or are assigned to
    if (req.user.role !== 'admin') {
      query = { 
        $or: [
          { createdBy: req.user._id },
          { assignedTo: req.user._id }
        ]
      };
    }
    
    const tasks = await Task.find(query);
    console.log(`Returning ${tasks.length} tasks`);
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task with the provided data
 *     security:
 *       - bearerAuth: []
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
app.post('/api/tasks', protect, taskValidationRules, validateRequest, async (req, res, next) => {
  console.log('Create task endpoint called');
  try {
    // Check if project exists
    const project = await Project.findById(req.body.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user has access to this project
    if (req.user.role !== 'admin' && 
        project.owner.toString() !== req.user._id.toString() && 
        !project.members.includes(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to add tasks to this project' 
      });
    }
    
    // Add creator to task
    req.body.createdBy = req.user._id;
    
    const task = new Task(req.body);
    const savedTask = await task.save();
    console.log(`Task created with ID: ${savedTask._id}`);
    res.status(201).json({
      success: true,
      data: savedTask
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Retrieve a task by its ID
 *     security:
 *       - bearerAuth: []
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
app.get('/api/tasks/:id', protect, async (req, res, next) => {
  console.log(`Get task endpoint called for ID: ${req.params.id}`);
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log(`Task not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check if user has access to this task
    if (req.user.role !== 'admin' && 
        task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this task' 
      });
    }
    
    console.log(`Returning task: ${task.title}`);
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/projects/{id}/tasks:
 *   get:
 *     summary: Get tasks for a project
 *     description: Retrieve all tasks for a specific project
 *     security:
 *       - bearerAuth: []
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
app.get('/api/projects/:id/tasks', protect, async (req, res, next) => {
  console.log(`Get tasks for project endpoint called for project ID: ${req.params.id}`);
  try {
    // Check if project exists and user has access
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user has access to this project
    if (req.user.role !== 'admin' && 
        project.owner.toString() !== req.user._id.toString() && 
        !project.members.includes(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this project' 
      });
    }
    
    const tasks = await Task.find({ project: req.params.id });
    console.log(`Returning ${tasks.length} tasks for project ${req.params.id}`);
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     security:
 *       - bearerAuth: []
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
app.get('/api/users', protect, authorize('admin'), async (req, res, next) => {
  console.log('Get all users endpoint called');
  try {
    const users = await User.find().select('-password');
    console.log(`Returning ${users.length} users`);
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Mount error handler
const errorHandler = require('./middleware/error');
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
});

module.exports = app; 