// const tf = require('@tensorflow/tfjs-node');
const Task = require('../../models/task');
const User = require('../../models/user');

console.log('Duration Prediction Service loaded (simplified version)');

/**
 * Predict the number of days a task will take to complete
 * @param {string} taskId - Task ID to predict duration for
 * @returns {Promise<Object>} Prediction results
 */
async function predictTaskDuration(taskId) {
  console.log(`Predicting duration for task ID: ${taskId}`);
  try {
    // Get task data
    console.log('Fetching task data...');
    const task = await Task.findById(taskId).populate('assignedTo');
    if (!task) {
      console.error(`Task not found with ID: ${taskId}`);
      throw new Error('Task not found');
    }
    console.log(`Found task: ${task.title}`);
    
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
    
    console.log(`Final prediction: ${predictedDays} days (best case: ${bestCase}, worst case: ${worstCase})`);
    
    // Calculate estimated completion date
    const now = new Date();
    const estimatedCompletionDate = new Date(now);
    estimatedCompletionDate.setDate(now.getDate() + predictedDays);
    
    const result = {
      taskId,
      taskTitle: task.title,
      predictedDays,
      bestCase,
      worstCase,
      estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
      confidence: 0.75, // Simulated confidence score
    };
    
    console.log('Duration prediction result:', result);
    return result;
  } catch (error) {
    console.error('Error predicting task duration:', error);
    throw error;
  }
}

/**
 * Predict durations for all tasks in a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of task duration predictions
 */
async function predictProjectTimeline(projectId) {
  console.log(`Predicting timeline for project ID: ${projectId}`);
  try {
    // Get all tasks for project
    console.log('Fetching tasks for project...');
    const tasks = await Task.find({ project: projectId }).populate('assignedTo');
    console.log(`Found ${tasks.length} tasks for project`);
    
    const predictions = [];
    
    // For each task, predict duration
    console.log('Generating predictions for each task...');
    for (const task of tasks) {
      console.log(`Calculating duration for task: ${task.title}`);
      
      // Base duration based on priority
      let basePrediction = 0;
      if (task.priority === 'high') {
        basePrediction = 3; // High priority tasks typically take 3 days
      } else if (task.priority === 'medium') {
        basePrediction = 5; // Medium priority tasks typically take 5 days
      } else {
        basePrediction = 7; // Low priority tasks typically take 7 days
      }
      
      let adjustedPrediction = basePrediction;
      
      if (task.status === 'in-progress') {
        adjustedPrediction *= 0.7;
      } else if (task.status === 'review') {
        adjustedPrediction *= 0.3;
      }
      
      const predictedDays = Math.round(adjustedPrediction * 10) / 10;
      
      // Calculate estimated completion date
      const now = new Date();
      const estimatedCompletionDate = new Date(now);
      estimatedCompletionDate.setDate(now.getDate() + predictedDays);
      
      predictions.push({
        taskId: task._id,
        taskTitle: task.title,
        predictedDays,
        estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
      });
      
      console.log(`Task "${task.title}" prediction: ${predictedDays} days, completion: ${estimatedCompletionDate.toISOString().split('T')[0]}`);
    }
    
    // Sort predictions by completion date
    predictions.sort((a, b) => 
      new Date(a.estimatedCompletionDate) - new Date(b.estimatedCompletionDate)
    );
    
    console.log(`Generated timeline predictions for ${predictions.length} tasks`);
    return predictions;
  } catch (error) {
    console.error('Error predicting project timeline:', error);
    throw error;
  }
}

module.exports = {
  predictTaskDuration,
  predictProjectTimeline
}; 