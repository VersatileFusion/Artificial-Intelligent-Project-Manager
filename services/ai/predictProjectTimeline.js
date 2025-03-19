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
    if (!durationModel && useTensorFlow) {
      console.log('Model not initialized, loading now...');
      durationModel = await loadOrCreateModel();
    }
    
    const predictions = [];
    
    // For each task, predict duration
    console.log(`Generating predictions for each task using ${useTensorFlow && durationModel ? 'ML' : 'heuristic'} approach...`);
    
    for (const task of tasks) {
      console.log(`Calculating duration for task: ${task.title}`);
      
      let predictedDays;
      let confidence = 0.75; // Default confidence
      let method = 'ml';
      
      // Use TensorFlow if available
      if (useTensorFlow && durationModel) {
        // Extract features
        const features = extractTaskFeatures(task);
        
        // Make prediction
        const prediction = durationModel.predict(features);
        predictedDays = prediction.dataSync()[0];
        
        // Cleanup tensors
        features.dispose();
        prediction.dispose();
        
        confidence = 0.8; // ML predictions have slightly higher confidence
      } else {
        // Use heuristic fallback
        method = 'heuristic';
        
        // Base prediction using heuristics
        let basePrediction = 0;
        if (task.priority === 'high') {
          basePrediction = 3; // High priority tasks typically take 3 days
        } else if (task.priority === 'medium') {
          basePrediction = 5; // Medium priority tasks typically take 5 days
        } else {
          basePrediction = 7; // Low priority tasks typically take 7 days
        }
        
        // Apply adjustments based on status
        if (task.status === 'in-progress') {
          basePrediction *= 0.7; // 30% less time if already started
        } else if (task.status === 'review') {
          basePrediction *= 0.3; // 70% less time if in review
        }
        
        predictedDays = basePrediction;
      }
      
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
        confidence,
        method
      });
      
      console.log(`Task "${task.title}" prediction: ${roundedPrediction} days, completion: ${estimatedCompletionDate.toISOString().split('T')[0]} (using ${method})`);
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