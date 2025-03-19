const tf = require('@tensorflow/tfjs-node');

/**
 * Service for AI-related functionality
 * Provides task time prediction, suggestions, and dependency analysis
 */
class AIService {
  constructor() {
    console.log('Initializing AI Service');
    this.model = null;
    this.isModelLoaded = false;
  }

  async initialize() {
    console.log('Loading AI model...');
    try {
      // Load the pre-trained model (you'll need to train and save this model separately)
      this.model = await tf.loadLayersModel('file://./models/task-prediction-model/model.json');
      this.isModelLoaded = true;
      console.log('AI model loaded successfully');
    } catch (error) {
      console.error('Error loading AI model:', error);
      console.log('Using fallback prediction method due to model loading failure');
      throw error;
    }
  }

  async predictTaskTime(taskFeatures) {
    console.log('Predicting task time with features:', taskFeatures);
    
    if (!this.isModelLoaded) {
      console.log('Model not loaded, initializing first');
      try {
        await this.initialize();
      } catch (error) {
        console.log('Using fallback prediction method');
        // Simple fallback if model fails to load
        return this._fallbackPrediction(taskFeatures);
      }
    }

    try {
      console.log('Creating input tensor from features');
      // Convert task features to tensor
      const inputTensor = tf.tensor2d([taskFeatures]);
      
      console.log('Running prediction with TensorFlow model');
      // Make prediction
      const prediction = this.model.predict(inputTensor);
      const predictedTime = await prediction.data();
      
      console.log('Raw prediction result:', predictedTime);
      
      // Clean up tensors
      console.log('Cleaning up tensors');
      inputTensor.dispose();
      prediction.dispose();
      
      console.log(`Final predicted time: ${predictedTime[0]} hours`);
      return predictedTime[0];
    } catch (error) {
      console.error('Error predicting task time:', error);
      console.log('Using fallback prediction due to error');
      return this._fallbackPrediction(taskFeatures);
    }
  }

  // Simple fallback prediction if the model fails
  _fallbackPrediction(taskFeatures) {
    console.log('Using fallback prediction method with features:', taskFeatures);
    // Simple heuristic: 
    // - 1 hour base time
    // - Add time based on title length (longer titles often mean more complex tasks)
    // - Add time based on description length
    // - Add time based on priority (high priority often means more complex)
    const baseTime = 1;
    const titleLengthFactor = taskFeatures[0] * 0.05;
    const descriptionLengthFactor = taskFeatures[1] * 0.01;
    const priorityFactor = taskFeatures[2] * 3 + taskFeatures[3] * 2 + taskFeatures[4] * 1;
    
    const estimatedTime = baseTime + titleLengthFactor + descriptionLengthFactor + priorityFactor;
    console.log(`Fallback estimated time: ${estimatedTime} hours`);
    return Math.max(1, Math.round(estimatedTime));
  }

  async generateTaskSuggestions(projectContext) {
    console.log('Generating task suggestions');
    console.log(`Task context: ${projectContext.task.title}`);
    console.log(`Number of existing tasks: ${projectContext.existingTasks.length}`);
    
    // This is a placeholder for the actual AI-based suggestion generation
    // In a real implementation, you would use a more sophisticated model
    const suggestions = [
      'Consider adding unit tests for better code quality',
      'Schedule a code review meeting',
      'Update documentation to reflect recent changes',
      'Consider adding error handling for edge cases',
      'Plan for performance optimization'
    ];

    console.log(`Generated ${suggestions.length} suggestions`);
    return suggestions;
  }

  async analyzeTaskDependencies(tasks) {
    console.log(`Analyzing dependencies among ${tasks.length} tasks`);
    
    // This is a placeholder for dependency analysis
    // In a real implementation, you would use graph algorithms and ML
    const dependencies = [];
    
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        if (Math.random() > 0.7) { // Simulated dependency detection
          dependencies.push({
            from: tasks[i]._id,
            to: tasks[j]._id,
            confidence: Math.random()
          });
          console.log(`Detected potential dependency: ${tasks[i].title} -> ${tasks[j].title}`);
        }
      }
    }

    console.log(`Found ${dependencies.length} potential dependencies`);
    return dependencies;
  }
}

module.exports = new AIService(); 