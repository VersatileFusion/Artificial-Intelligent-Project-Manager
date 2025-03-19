// Try to load TensorFlow, but provide a fallback if it fails
let tf;
let useTensorFlow = false;
try {
  tf = require('@tensorflow/tfjs-node');
  useTensorFlow = true;
  console.log('TensorFlow Task Suggestion Service loaded');
} catch (error) {
  console.warn('TensorFlow initialization failed, using heuristic fallback instead:');
  console.warn(error.message);
  console.log('Heuristic Task Suggestion Service loaded');
}

const Project = require('../../models/project');
const Task = require('../../models/task');
const User = require('../../models/user');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define model directory for saving/loading models
const MODEL_DIR = path.join(__dirname, '../../models/ai');
const SUGGESTION_MODEL_PATH = path.join(MODEL_DIR, 'suggestion_model');

// Ensure the model directory exists
if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
  console.log(`Created model directory at ${MODEL_DIR}`);
}

// Model instance
let suggestionModel;

// Common task templates for various project types
const TASK_TEMPLATES = {
  development: [
    { title: 'Setup development environment', priority: 'high', category: 'setup' },
    { title: 'Create project structure', priority: 'high', category: 'setup' },
    { title: 'Setup version control', priority: 'high', category: 'setup' },
    { title: 'Define API endpoints', priority: 'medium', category: 'planning' },
    { title: 'Create database schema', priority: 'high', category: 'planning' },
    { title: 'Implement authentication', priority: 'high', category: 'implementation' },
    { title: 'Implement user management', priority: 'medium', category: 'implementation' },
    { title: 'Create frontend components', priority: 'medium', category: 'implementation' },
    { title: 'Setup CI/CD pipeline', priority: 'medium', category: 'infrastructure' },
    { title: 'Write unit tests', priority: 'medium', category: 'testing' },
    { title: 'Perform integration testing', priority: 'medium', category: 'testing' },
    { title: 'Deploy to staging', priority: 'medium', category: 'deployment' },
    { title: 'Deploy to production', priority: 'high', category: 'deployment' },
    { title: 'Write documentation', priority: 'low', category: 'documentation' }
  ],
  
  marketing: [
    { title: 'Define target audience', priority: 'high', category: 'planning' },
    { title: 'Conduct market research', priority: 'high', category: 'research' },
    { title: 'Create marketing strategy', priority: 'high', category: 'planning' },
    { title: 'Design marketing materials', priority: 'medium', category: 'creation' },
    { title: 'Setup social media accounts', priority: 'medium', category: 'setup' },
    { title: 'Create content calendar', priority: 'medium', category: 'planning' },
    { title: 'Launch social media campaign', priority: 'high', category: 'execution' },
    { title: 'Monitor campaign performance', priority: 'medium', category: 'monitoring' },
    { title: 'Create analytical report', priority: 'low', category: 'reporting' }
  ],
  
  general: [
    { title: 'Define project scope', priority: 'high', category: 'planning' },
    { title: 'Create project timeline', priority: 'high', category: 'planning' },
    { title: 'Assign team members', priority: 'high', category: 'planning' },
    { title: 'Schedule kick-off meeting', priority: 'medium', category: 'communication' },
    { title: 'Create progress reporting template', priority: 'low', category: 'communication' },
    { title: 'Conduct weekly status meetings', priority: 'medium', category: 'communication' },
    { title: 'Review project milestones', priority: 'medium', category: 'monitoring' },
    { title: 'Prepare final delivery', priority: 'high', category: 'execution' },
    { title: 'Project retrospective', priority: 'low', category: 'closure' }
  ]
};

// Project feature encoding maps
const PROJECT_STATUS_MAP = {
  'planning': 0,
  'in-progress': 0.5,
  'completed': 1,
  'on-hold': 0.25
};

// Project categories (derived from task distribution)
const PROJECT_CATEGORIES = ['development', 'marketing', 'general'];

/**
 * Create and train a task suggestion model
 * @returns {Promise<tf.LayersModel>} Trained TensorFlow model
 */
async function createAndTrainModel() {
  console.log('Creating and training task suggestion model...');
  
  // Generate synthetic training data
  const trainingData = generateSyntheticTrainingData();
  
  // Prepare training data
  const { xs, ys } = prepareTrainingData(trainingData);
  
  // Define model architecture
  const model = tf.sequential();
  
  // Input layer with 5 features (project status, progress, days remaining, team size, existing task count)
  model.add(tf.layers.dense({
    units: 12,
    activation: 'relu',
    inputShape: [5]
  }));
  
  // Hidden layer
  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu'
  }));
  
  // Output layer (3 categories of project types)
  model.add(tf.layers.dense({
    units: 3,
    activation: 'softmax'
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  // Train the model
  const epochs = 100;
  const batchSize = 32;
  
  await model.fit(xs, ys, {
    epochs,
    batchSize,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 10 === 0) {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        }
      }
    }
  });
  
  console.log('Model training completed');
  return model;
}

/**
 * Generate synthetic training data for the model
 * @returns {Array} Array of synthetic training samples
 */
function generateSyntheticTrainingData() {
  console.log('Generating synthetic training data...');
  const syntheticData = [];
  
  // Generate 300 random project scenarios (100 for each category)
  for (let category of PROJECT_CATEGORIES) {
    for (let i = 0; i < 100; i++) {
      // Generate random project features
      const status = ['planning', 'in-progress', 'on-hold', 'completed'][Math.floor(Math.random() * 3)];
      const progress = Math.random(); // 0-1 scale
      const daysRemaining = Math.floor(Math.random() * 100) + 1; // 1-100 days
      const teamSize = Math.floor(Math.random() * 10) + 1; // 1-10 members
      const existingTaskCount = Math.floor(Math.random() * 30); // 0-30 tasks
      
      // Adjust features to make them more realistic for each category
      let adjustedFeatures = {
        status,
        progress,
        daysRemaining,
        teamSize,
        existingTaskCount,
        category
      };
      
      if (category === 'development') {
        // Development projects tend to have more tasks and larger teams
        adjustedFeatures.teamSize = Math.min(adjustedFeatures.teamSize + 2, 10);
        adjustedFeatures.existingTaskCount = Math.min(adjustedFeatures.existingTaskCount + 5, 30);
      } else if (category === 'marketing') {
        // Marketing projects tend to have shorter timelines
        adjustedFeatures.daysRemaining = Math.max(1, adjustedFeatures.daysRemaining - 20);
      }
      
      syntheticData.push(adjustedFeatures);
    }
  }
  
  console.log(`Generated ${syntheticData.length} synthetic training records`);
  return syntheticData;
}

/**
 * Prepare training data for TensorFlow model
 * @param {Array} projects - Array of project data
 * @returns {Object} Object containing input tensors (xs) and output tensors (ys)
 */
function prepareTrainingData(projects) {
  // Extract features and targets
  const features = [];
  const targets = [];
  
  projects.forEach(project => {
    // Features: status, progress, days remaining, team size, existing task count
    features.push([
      PROJECT_STATUS_MAP[project.status] || 0,
      project.progress,
      normalizeValue(project.daysRemaining, 0, 100),
      normalizeValue(project.teamSize, 1, 10),
      normalizeValue(project.existingTaskCount, 0, 30)
    ]);
    
    // Target: one-hot encoded project category
    const categoryIndex = PROJECT_CATEGORIES.indexOf(project.category);
    const oneHotCategory = [0, 0, 0];
    oneHotCategory[categoryIndex] = 1;
    targets.push(oneHotCategory);
  });
  
  // Convert to tensors
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(targets);
  
  return { xs, ys };
}

/**
 * Normalize a value to the range 0-1
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum possible value
 * @param {number} max - Maximum possible value
 * @returns {number} Normalized value between 0-1
 */
function normalizeValue(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Save model to disk
 * @param {tf.LayersModel} model - TensorFlow model to save
 * @returns {Promise<void>}
 */
async function saveModel(model) {
  console.log(`Saving task suggestion model to ${SUGGESTION_MODEL_PATH}...`);
  await model.save(`file://${SUGGESTION_MODEL_PATH}`);
  console.log('Model saved successfully');
}

/**
 * Load model from disk or create a new one if not found
 * @returns {Promise<tf.LayersModel>} TensorFlow model
 */
async function loadOrCreateModel() {
  // If TensorFlow is not available, return null
  if (!useTensorFlow) {
    console.log('TensorFlow not available, skipping model loading');
    return null;
  }
  
  try {
    console.log(`Attempting to load model from ${SUGGESTION_MODEL_PATH}...`);
    if (fs.existsSync(`${SUGGESTION_MODEL_PATH}/model.json`)) {
      const model = await tf.loadLayersModel(`file://${SUGGESTION_MODEL_PATH}/model.json`);
      console.log('Task suggestion model loaded successfully');
      return model;
    } else {
      console.log('No existing task suggestion model found, creating a new one...');
      const model = await createAndTrainModel();
      await saveModel(model);
      return model;
    }
  } catch (error) {
    console.error('Error loading task suggestion model:', error);
    console.log('Creating a new task suggestion model instead...');
    const model = await createAndTrainModel();
    await saveModel(model);
    return model;
  }
}

// Initialize model on module load
(async () => {
  try {
    suggestionModel = await loadOrCreateModel();
    console.log('Task suggestion model initialized');
  } catch (error) {
    console.error('Failed to initialize task suggestion model:', error);
  }
})();

/**
 * Extract features from a project for prediction
 * @param {Object} project - Project object from MongoDB
 * @param {number} existingTaskCount - Number of existing tasks
 * @returns {tf.Tensor2d} Tensor of project features
 */
function extractProjectFeatures(project, existingTaskCount) {
  // Extract features
  const statusValue = PROJECT_STATUS_MAP[project.status] || 0;
  
  // Calculate progress as percentage of days elapsed
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const now = new Date();
  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);
  const progress = Math.max(0, Math.min(1, daysElapsed / totalDays));
  
  // Calculate days remaining
  const daysRemaining = Math.max(0, (endDate - now) / (1000 * 60 * 60 * 24));
  
  // Team size (including owner)
  const teamSize = project.members.length + 1;
  
  // Create a tensor with these features
  return tf.tensor2d([
    [
      statusValue,
      progress,
      normalizeValue(daysRemaining, 0, 100),
      normalizeValue(teamSize, 1, 10),
      normalizeValue(existingTaskCount, 0, 30)
    ]
  ]);
}

/**
 * Generate task suggestions for a project using TensorFlow
 * @param {string} projectId - Project ID
 * @param {number} count - Number of tasks to suggest (default: 3)
 * @returns {Promise<Array>} Array of suggested tasks
 */
async function suggestTasks(projectId, count = 3) {
  console.log(`Suggesting ${count} tasks for project ID: ${projectId}`);
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.error(`Invalid project ID format: ${projectId}`);
      throw new Error('Invalid project ID format. Must be a valid MongoDB ObjectId');
    }
    
    // Get project data
    console.log('Fetching project data...');
    const project = await Project.findById(projectId).populate('members');
    if (!project) {
      console.error(`Project not found with ID: ${projectId}`);
      throw new Error('Project not found');
    }
    console.log(`Found project: ${project.name}`);
    
    // Get existing tasks to avoid duplicates
    console.log('Fetching existing tasks...');
    const existingTasks = await Task.find({ project: projectId });
    console.log(`Found ${existingTasks.length} existing tasks`);
    const existingTaskTitles = new Set(existingTasks.map(t => t.title.toLowerCase()));
    
    let predictedCategory = 'general';
    let categoryConfidence = 0;
    let method = 'ml';
    
    // Use TensorFlow if available
    if (useTensorFlow && suggestionModel) {
      console.log('Using TensorFlow prediction model...');
      
      // Make sure model is loaded
      if (!suggestionModel) {
        console.log('Model not initialized, loading now...');
        suggestionModel = await loadOrCreateModel();
      }
      
      // Extract features from project
      const features = extractProjectFeatures(project, existingTasks.length);
      
      // Make prediction to determine project category
      console.log('Running TensorFlow prediction for project category...');
      const prediction = suggestionModel.predict(features);
      const categoryScores = prediction.dataSync();
      
      // Get predicted category index
      const categoryIndex = categoryScores.indexOf(Math.max(...categoryScores));
      predictedCategory = PROJECT_CATEGORIES[categoryIndex];
      categoryConfidence = categoryScores[categoryIndex];
      console.log(`ML predicted project category: ${predictedCategory} (confidence: ${(categoryConfidence * 100).toFixed(2)}%)`);
      
      // Cleanup tensors
      features.dispose();
      prediction.dispose();
    } else {
      console.log('Using heuristic fallback for task suggestions...');
      method = 'heuristic';
      
      // Use a simple keyword-based approach to determine project category
      const projectDescription = (project.description || '').toLowerCase();
      const projectName = project.name.toLowerCase();
      
      // Count occurrences of category-related keywords
      const categoryKeywords = {
        development: ['develop', 'code', 'program', 'software', 'app', 'application', 'web', 'api', 'database', 'frontend', 'backend'],
        marketing: ['market', 'campaign', 'content', 'social', 'brand', 'audience', 'promotion', 'advertis', 'seo', 'media'],
        general: ['project', 'manage', 'plan', 'organiz', 'schedule', 'team', 'task', 'document', 'meet', 'report']
      };
      
      const scores = {};
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        scores[category] = keywords.reduce((score, keyword) => {
          const nameMatches = (projectName.match(new RegExp(keyword, 'g')) || []).length;
          const descMatches = (projectDescription.match(new RegExp(keyword, 'g')) || []).length;
          return score + nameMatches * 2 + descMatches; // Name matches count double
        }, 0);
      }
      
      // Also factor in existing task titles
      const existingTaskNames = existingTasks.map(t => t.title.toLowerCase()).join(' ');
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const taskMatches = keywords.reduce((score, keyword) => {
          const matches = (existingTaskNames.match(new RegExp(keyword, 'g')) || []).length;
          return score + matches;
        }, 0);
        scores[category] += taskMatches;
      }
      
      // Find the category with the highest score
      let highestScore = 0;
      for (const [category, score] of Object.entries(scores)) {
        if (score > highestScore) {
          highestScore = score;
          predictedCategory = category;
        }
      }
      
      // If all scores are 0 or equal, default to general
      if (highestScore === 0) {
        predictedCategory = 'general';
      }
      
      // Calculate a simulated confidence
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      categoryConfidence = totalScore > 0 ? scores[predictedCategory] / totalScore : 0.5;
      
      console.log(`Heuristic predicted project category: ${predictedCategory} (confidence: ${(categoryConfidence * 100).toFixed(2)}%)`);
    }
    
    // Get task templates for predicted category and general tasks
    const categoryTasks = TASK_TEMPLATES[predictedCategory] || [];
    const generalTasks = TASK_TEMPLATES.general;
    const allTaskTemplates = [...categoryTasks, ...generalTasks];
    
    // Filter out existing tasks
    console.log('Filtering out existing tasks...');
    const newTaskTemplates = allTaskTemplates.filter(task => 
      !existingTaskTitles.has(task.title.toLowerCase())
    );
    console.log(`${newTaskTemplates.length} new task templates available after filtering`);
    
    // If we have too few tasks after filtering, add generic tasks
    if (newTaskTemplates.length < count) {
      console.log('Adding generic tasks to meet suggestion count...');
      const genericTasks = [
        { title: `Project milestone ${existingTasks.length + 1}`, priority: 'high', category: 'milestone' },
        { title: `Weekly team meeting ${Math.floor(Math.random() * 10) + 1}`, priority: 'medium', category: 'meeting' },
        { title: `Review progress for week ${Math.floor(Math.random() * 10) + 1}`, priority: 'medium', category: 'review' },
      ];
      
      newTaskTemplates.push(...genericTasks);
      console.log(`Added ${genericTasks.length} generic tasks`);
    }
    
    // Select tasks and enhance with project-specific details
    console.log('Generating final task suggestions...');
    const suggestedTasks = newTaskTemplates.slice(0, count).map(template => {
      // Calculate a due date between start and end date
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const randomDays = Math.floor(Math.random() * 
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + randomDays);
      
      // Randomly assign to a team member
      const assignedTo = project.members.length > 0 
        ? project.members[Math.floor(Math.random() * project.members.length)]._id
        : project.owner;
      
      return {
        ...template,
        description: `AI-suggested task: ${template.title} for project "${project.name}"`,
        dueDate,
        project: projectId,
        assignedTo,
        createdBy: project.owner,
        confidence: (categoryConfidence * 100).toFixed(2),
        method
      };
    });
    
    console.log(`Generated ${suggestedTasks.length} task suggestions for project ${project.name} using ${method}`);
    suggestedTasks.forEach((task, index) => {
      console.log(`Task ${index + 1}: ${task.title} (Due: ${task.dueDate.toISOString().split('T')[0]})`);
    });
    
    return suggestedTasks;
  } catch (error) {
    console.error('Error suggesting tasks:', error);
    throw error;
  }
}

module.exports = {
  suggestTasks,
  // Export for testing/training
  createAndTrainModel,
  saveModel
}; 