// Try to load TensorFlow, but provide a fallback if it fails
let tf;
let useTensorFlow = false;
try {
  tf = require('@tensorflow/tfjs-node');
  useTensorFlow = true;
  console.log('TensorFlow Duration Prediction Service loaded');
} catch (error) {
  console.warn('TensorFlow initialization failed, using heuristic fallback instead:');
  console.warn(error.message);
  console.log('Heuristic Duration Prediction Service loaded');
}

const Task = require('../../models/task');
const User = require('../../models/user');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define model directory for saving/loading models
const MODEL_DIR = path.join(__dirname, '../../models/ai');
const DURATION_MODEL_PATH = path.join(MODEL_DIR, 'duration_model');

// Ensure the model directory exists
if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
  console.log(`Created model directory at ${MODEL_DIR}`);
}

// Task features normalization constants
const PRIORITY_MAP = { 'low': 0, 'medium': 0.5, 'high': 1 };
const STATUS_MAP = { 'todo': 0, 'in-progress': 0.5, 'review': 0.75, 'completed': 1 };

// Model instance
let durationModel;

/**
 * Create and train a task duration prediction model
 * @param {Array} trainingData - Array of task data for training
 * @returns {Promise<tf.LayersModel>} Trained TensorFlow model
 */
async function createAndTrainModel(trainingData) {
  console.log('Creating and training duration prediction model...');
  
  if (!trainingData || trainingData.length === 0) {
    console.warn('No training data provided, creating model with random weights');
    trainingData = generateSyntheticTrainingData();
  }
  
  // Prepare training data
  const { xs, ys } = prepareTrainingData(trainingData);
  
  // Define model architecture
  const model = tf.sequential();
  
  // Input layer with 4 features
  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu',
    inputShape: [4]
  }));
  
  // Hidden layer
  model.add(tf.layers.dense({
    units: 4,
    activation: 'relu'
  }));
  
  // Output layer (prediction in days)
  model.add(tf.layers.dense({
    units: 1
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'meanSquaredError'
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
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
        }
      }
    }
  });
  
  console.log('Model training completed');
  return model;
}

/**
 * Generate synthetic training data when no real data is available
 * @returns {Array} Array of synthetic task data
 */
function generateSyntheticTrainingData() {
  console.log('Generating synthetic training data...');
  const syntheticData = [];
  
  // Generate 100 random tasks with expected durations
  for (let i = 0; i < 100; i++) {
    const priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
    const status = ['todo', 'in-progress', 'review'][Math.floor(Math.random() * 3)];
    const complexity = Math.random(); // 0-1 scale
    const assigneeExperience = Math.random(); // 0-1 scale
    
    // Generate target duration using a rule-based approach
    let duration;
    if (priority === 'high') {
      duration = 2 + (complexity * 3);
    } else if (priority === 'medium') {
      duration = 3 + (complexity * 4);
    } else {
      duration = 5 + (complexity * 5);
    }
    
    // Adjust for status
    if (status === 'in-progress') {
      duration *= 0.7;
    } else if (status === 'review') {
      duration *= 0.3;
    }
    
    // Adjust for assignee experience
    duration *= (1.2 - (assigneeExperience * 0.4));
    
    syntheticData.push({
      priority,
      status,
      complexity,
      assigneeExperience,
      duration: Math.round(duration * 10) / 10 // Round to 1 decimal place
    });
  }
  
  console.log(`Generated ${syntheticData.length} synthetic training records`);
  return syntheticData;
}

/**
 * Prepare training data for TensorFlow model
 * @param {Array} tasks - Array of task data
 * @returns {Object} Object containing input tensors (xs) and output tensors (ys)
 */
function prepareTrainingData(tasks) {
  // Extract features and targets
  const features = [];
  const targets = [];
  
  tasks.forEach(task => {
    // Features: priority, status, complexity, assignee experience
    features.push([
      PRIORITY_MAP[task.priority] || 0.5,
      STATUS_MAP[task.status] || 0,
      task.complexity || 0.5,
      task.assigneeExperience || 0.5
    ]);
    
    // Target: duration in days
    targets.push([task.duration]);
  });
  
  // Convert to tensors
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(targets);
  
  return { xs, ys };
}

/**
 * Save model to disk
 * @param {tf.LayersModel} model - TensorFlow model to save
 * @returns {Promise<void>}
 */
async function saveModel(model) {
  console.log(`Saving duration prediction model to ${DURATION_MODEL_PATH}...`);
  await model.save(`file://${DURATION_MODEL_PATH}`);
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
    console.log(`Attempting to load model from ${DURATION_MODEL_PATH}...`);
    if (fs.existsSync(`${DURATION_MODEL_PATH}/model.json`)) {
      const model = await tf.loadLayersModel(`file://${DURATION_MODEL_PATH}/model.json`);
      console.log('Model loaded successfully');
      return model;
    } else {
      console.log('No existing model found, creating a new one...');
      const model = await createAndTrainModel();
      await saveModel(model);
      return model;
    }
  } catch (error) {
    console.error('Error loading model:', error);
    console.log('Creating a new model instead...');
    const model = await createAndTrainModel();
    await saveModel(model);
    return model;
  }
}

// Initialize model on module load
(async () => {
  try {
    durationModel = await loadOrCreateModel();
    console.log('Duration prediction model initialized');
  } catch (error) {
    console.error('Failed to initialize duration prediction model:', error);
  }
})();

/**
 * Extract features from a task for prediction
 * @param {Object} task - Task object from MongoDB
 * @returns {tf.Tensor2d} Tensor of task features
 */
function extractTaskFeatures(task) {
  // Default values if some properties are missing
  const defaultComplexity = 0.5;
  const defaultExperience = 0.5;
  
  // Extract features
  const priorityValue = PRIORITY_MAP[task.priority] || 0.5;
  const statusValue = STATUS_MAP[task.status] || 0;
  
  // For now, we use default values for complexity and assignee experience
  // In a real system, these would come from historical data
  const complexity = defaultComplexity;
  const assigneeExperience = defaultExperience;
  
  // Create a tensor with these features
  return tf.tensor2d([[priorityValue, statusValue, complexity, assigneeExperience]]);
}

/**
 * Predict the number of days a task will take to complete using TensorFlow
 * @param {string} taskId - Task ID to predict duration for
 * @returns {Promise<Object>} Prediction results
 */
async function predictTaskDuration(taskId) {
  console.log(`Predicting duration for task ID: ${taskId}`);
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.error(`Invalid task ID format: ${taskId}`);
      throw new Error('Invalid task ID format. Must be a valid MongoDB ObjectId');
    }
    
    // Get task data
    console.log('Fetching task data...');
    const task = await Task.findById(taskId).populate('assignedTo');
    if (!task) {
      console.error(`Task not found with ID: ${taskId}`);
      throw new Error('Task not found');
    }
    console.log(`Found task: ${task.title}`);
    
    // Use TensorFlow if available, otherwise use heuristic approach
    if (useTensorFlow && durationModel) {
      console.log('Using TensorFlow prediction model...');
      // Extract features from task
      const features = extractTaskFeatures(task);
      
      // Make prediction
      console.log('Running TensorFlow prediction...');
      const prediction = durationModel.predict(features);
      const predictedDays = prediction.dataSync()[0];
      
      // Round to reasonable values
      const roundedPrediction = Math.round(predictedDays * 10) / 10; // Round to 1 decimal place
      const bestCase = Math.max(0.5, Math.round(predictedDays * 0.7 * 10) / 10);
      const worstCase = Math.round(predictedDays * 1.3 * 10) / 10;
      
      // Calculate estimated completion date
      const now = new Date();
      const estimatedCompletionDate = new Date(now);
      estimatedCompletionDate.setDate(now.getDate() + roundedPrediction);
      
      // Cleanup tensors
      features.dispose();
      prediction.dispose();
      
      console.log(`ML prediction for task "${task.title}": ${roundedPrediction} days`);
      
      return {
        taskId: task._id,
        taskTitle: task.title,
        predictedDays: roundedPrediction,
        bestCase,
        worstCase,
        estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
        confidence: 0.8, // Simplified - would normally be calculated from model
        modelVersion: '1.0',
        method: 'ml'
      };
    } else {
      console.log('Using heuristic fallback for prediction...');
      
      // Calculate base prediction using heuristics
      console.log('Calculating duration based on task properties...');
      
      // Base duration based on priority
      let basePrediction = 0;
      if (task.priority === 'high') {
        basePrediction = 3; // High priority tasks typically take 3 days
      } else if (task.priority === 'medium') {
        basePrediction = 5; // Medium priority tasks typically take 5 days
      } else {
        basePrediction = 7; // Low priority tasks typically take 7 days
      }
      console.log(`Base prediction based on priority (${task.priority}): ${basePrediction} days`);
      
      // Apply adjustments based on status
      let adjustedPrediction = basePrediction;
      
      // Tasks already in progress should take less time
      if (task.status === 'in-progress') {
        adjustedPrediction *= 0.7; // 30% less time if already started
        console.log(`Adjusted for in-progress status: ${adjustedPrediction.toFixed(1)} days`);
      } else if (task.status === 'review') {
        adjustedPrediction *= 0.3; // 70% less time if in review
        console.log(`Adjusted for review status: ${adjustedPrediction.toFixed(1)} days`);
      }
      
      // Round to reasonable values
      const predictedDays = Math.round(adjustedPrediction * 10) / 10; // Round to 1 decimal place
      const bestCase = Math.max(0.5, Math.round(predictedDays * 0.7 * 10) / 10);
      const worstCase = Math.round(predictedDays * 1.5 * 10) / 10;
      
      console.log(`Final heuristic prediction: ${predictedDays} days (best case: ${bestCase}, worst case: ${worstCase})`);
      
      // Calculate estimated completion date
      const now = new Date();
      const estimatedCompletionDate = new Date(now);
      estimatedCompletionDate.setDate(now.getDate() + predictedDays);
      
      return {
        taskId: task._id,
        taskTitle: task.title,
        predictedDays,
        bestCase,
        worstCase,
        estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
        confidence: 0.75, // Simulated confidence score
        method: 'heuristic'
      };
    }
  } catch (error) {
    console.error('Error predicting task duration:', error);
    throw error;
  }
}

/**
 * Predict durations for all tasks in a project using TensorFlow
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of task duration predictions
 */
async function predictProjectTimeline(projectId) {
  console.log(`Predicting timeline for project ID: ${projectId}`);
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.error(`Invalid project ID format: ${projectId}`);
      throw new Error('Invalid project ID format. Must be a valid MongoDB ObjectId');
    }
    
    // Get all tasks for project
    console.log('Fetching tasks for project...');
    const tasks = await Task.find({ project: projectId }).populate('assignedTo');
    console.log(`Found ${tasks.length} tasks for project`);
    
    // Make sure model is loaded
    if (!durationModel) {
      console.log('Model not initialized, loading now...');
      durationModel = await loadOrCreateModel();
    }
    
    const predictions = [];
    
    // For each task, predict duration
    console.log('Generating ML predictions for each task...');
    for (const task of tasks) {
      console.log(`Calculating duration for task: ${task.title}`);
      
      // Extract features
      const features = extractTaskFeatures(task);
      
      // Make prediction
      const prediction = durationModel.predict(features);
      const predictedDays = prediction.dataSync()[0];
      const roundedPrediction = Math.round(predictedDays * 10) / 10;
      
      // Calculate estimated completion date
      const now = new Date();
      const estimatedCompletionDate = new Date(now);
      estimatedCompletionDate.setDate(now.getDate() + roundedPrediction);
      
      predictions.push({
        taskId: task._id,
        taskTitle: task.title,
        predictedDays: roundedPrediction,
        estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
        confidence: 0.8 // Simplified
      });
      
      console.log(`Task "${task.title}" ML prediction: ${roundedPrediction} days, completion: ${estimatedCompletionDate.toISOString().split('T')[0]}`);
      
      // Cleanup tensors
      features.dispose();
      prediction.dispose();
    }
    
    // Sort predictions by completion date
    predictions.sort((a, b) => 
      new Date(a.estimatedCompletionDate) - new Date(b.estimatedCompletionDate)
    );
    
    console.log(`Generated ML timeline predictions for ${predictions.length} tasks`);
    return predictions;
  } catch (error) {
    console.error('Error predicting project timeline:', error);
    throw error;
  }
}

module.exports = {
  predictTaskDuration,
  predictProjectTimeline,
  // Export these for testing/training purposes
  createAndTrainModel,
  saveModel
}; 