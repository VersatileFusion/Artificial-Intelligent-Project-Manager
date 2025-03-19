// Try to load TensorFlow, but provide a fallback if it fails
let tf;
let useTensorFlow = false;
try {
  tf = require('@tensorflow/tfjs-node');
  useTensorFlow = true;
  console.log('TensorFlow Workflow Optimization Service loaded');
} catch (error) {
  console.warn('TensorFlow initialization failed, using heuristic fallback instead:');
  console.warn(error.message);
  console.log('Heuristic Workflow Optimization Service loaded');
}

const Task = require('../../models/task');
const Project = require('../../models/project');
const User = require('../../models/user');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define model directory for saving/loading models
const MODEL_DIR = path.join(__dirname, '../../models/ai');
const WORKFLOW_MODEL_PATH = path.join(MODEL_DIR, 'workflow_model');

// Ensure the model directory exists
if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
  console.log(`Created model directory at ${MODEL_DIR}`);
}

// Model instance
let workflowModel;

// Priority and status encoding maps
const PRIORITY_MAP = { 'low': 0, 'medium': 0.5, 'high': 1 };
const STATUS_MAP = { 'todo': 0, 'in-progress': 0.5, 'review': 0.75, 'completed': 1 };

/**
 * Create and train a workflow optimization model
 * @returns {Promise<tf.LayersModel>} Trained TensorFlow model
 */
async function createAndTrainModel() {
  console.log('Creating and training workflow optimization model...');
  
  // Generate synthetic training data
  const trainingData = generateSyntheticTrainingData();
  
  // Prepare training data
  const { xs, ys } = prepareTrainingData(trainingData);
  
  // Define model architecture
  const model = tf.sequential();
  
  // Input layer with 5 features
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu',
    inputShape: [5]
  }));
  
  // Hidden layer
  model.add(tf.layers.dense({
    units: 12,
    activation: 'relu'
  }));
  
  // Hidden layer
  model.add(tf.layers.dense({
    units: 8,
    activation: 'relu'
  }));
  
  // Output layer (5 bottleneck scores)
  model.add(tf.layers.dense({
    units: 5
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
 * Generate synthetic training data for workflow optimization
 * @returns {Array} Array of synthetic workflow data
 */
function generateSyntheticTrainingData() {
  console.log('Generating synthetic workflow training data...');
  const syntheticData = [];
  
  // Generate 500 random workflow scenarios
  for (let i = 0; i < 500; i++) {
    // Project features
    const todoRatio = Math.random(); // 0-1
    const inProgressRatio = Math.random() * (1 - todoRatio); // 0-1, but ensures sum < 1
    const reviewRatio = Math.random() * (1 - todoRatio - inProgressRatio); // 0-1, ensuring sum < 1
    const completedRatio = 1 - todoRatio - inProgressRatio - reviewRatio; // Ensures sum = 1
    const teamLoadBalance = Math.random(); // 0-1, higher is better balanced
    
    // Generate target optimization scores
    // These would normally be derived from real project outcomes
    // but we'll use rule-based logic for synthetic data
    
    // Resource bottleneck score (higher = more severe bottleneck)
    let resourceBottleneck = 0;
    if (teamLoadBalance < 0.3) {
      resourceBottleneck = 0.8 + (Math.random() * 0.2); // Severe bottleneck
    } else if (teamLoadBalance < 0.6) {
      resourceBottleneck = 0.4 + (Math.random() * 0.4); // Moderate bottleneck
    } else {
      resourceBottleneck = Math.random() * 0.4; // Minor or no bottleneck
    }
    
    // Task distribution bottleneck (higher = more tasks stuck in one status)
    let taskDistributionScore = 0;
    const maxRatio = Math.max(todoRatio, inProgressRatio, reviewRatio);
    if (maxRatio > 0.6) {
      taskDistributionScore = 0.7 + (Math.random() * 0.3); // Too many tasks in one status
    } else if (maxRatio > 0.4) {
      taskDistributionScore = 0.3 + (Math.random() * 0.4); // Somewhat unbalanced
    } else {
      taskDistributionScore = Math.random() * 0.3; // Well balanced
    }
    
    // Workflow efficiency score (higher = more inefficient)
    let workflowEfficiency = 0;
    if (inProgressRatio > 0.5) {
      workflowEfficiency = 0.7 + (Math.random() * 0.3); // Too many in-progress tasks
    } else if (todoRatio > 0.7) {
      workflowEfficiency = 0.5 + (Math.random() * 0.3); // Too many todo tasks
    } else if (reviewRatio > 0.3) {
      workflowEfficiency = 0.4 + (Math.random() * 0.3); // Tasks stuck in review
    } else {
      workflowEfficiency = Math.random() * 0.4; // Good workflow
    }
    
    // Task dependency bottleneck (higher = more blocking dependencies)
    const taskDependencyScore = Math.random(); // Randomize for synthetic data
    
    // Priority alignment score (higher = more misaligned priorities)
    const priorityAlignmentScore = Math.random(); // Randomize for synthetic data
    
    syntheticData.push({
      features: {
        todoRatio,
        inProgressRatio,
        reviewRatio,
        completedRatio,
        teamLoadBalance
      },
      targets: {
        resourceBottleneck,
        taskDistributionScore,
        workflowEfficiency,
        taskDependencyScore,
        priorityAlignmentScore
      }
    });
  }
  
  console.log(`Generated ${syntheticData.length} synthetic workflow records`);
  return syntheticData;
}

/**
 * Prepare training data for TensorFlow model
 * @param {Array} workflows - Array of workflow data
 * @returns {Object} Object containing input tensors (xs) and output tensors (ys)
 */
function prepareTrainingData(workflows) {
  // Extract features and targets
  const features = [];
  const targets = [];
  
  workflows.forEach(workflow => {
    const { todoRatio, inProgressRatio, reviewRatio, completedRatio, teamLoadBalance } = workflow.features;
    const { resourceBottleneck, taskDistributionScore, workflowEfficiency, taskDependencyScore, priorityAlignmentScore } = workflow.targets;
    
    // Features
    features.push([
      todoRatio,
      inProgressRatio,
      reviewRatio,
      completedRatio,
      teamLoadBalance
    ]);
    
    // Targets
    targets.push([
      resourceBottleneck,
      taskDistributionScore,
      workflowEfficiency,
      taskDependencyScore,
      priorityAlignmentScore
    ]);
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
  console.log(`Saving workflow optimization model to ${WORKFLOW_MODEL_PATH}...`);
  await model.save(`file://${WORKFLOW_MODEL_PATH}`);
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
    console.log(`Attempting to load model from ${WORKFLOW_MODEL_PATH}...`);
    if (fs.existsSync(`${WORKFLOW_MODEL_PATH}/model.json`)) {
      const model = await tf.loadLayersModel(`file://${WORKFLOW_MODEL_PATH}/model.json`);
      console.log('Workflow optimization model loaded successfully');
      return model;
    } else {
      console.log('No existing workflow model found, creating a new one...');
      const model = await createAndTrainModel();
      await saveModel(model);
      return model;
    }
  } catch (error) {
    console.error('Error loading workflow model:', error);
    console.log('Creating a new workflow model instead...');
    const model = await createAndTrainModel();
    await saveModel(model);
    return model;
  }
}

// Initialize model on module load
(async () => {
  try {
    workflowModel = await loadOrCreateModel();
    console.log('Workflow optimization model initialized');
  } catch (error) {
    console.error('Failed to initialize workflow optimization model:', error);
  }
})();

/**
 * Extract features from project data for workflow optimization
 * @param {Object} project - Project object
 * @param {Array} tasks - Array of tasks for the project
 * @param {Array} members - Array of team members
 * @returns {tf.Tensor2d} Tensor of project workflow features
 */
function extractWorkflowFeatures(project, tasks, members) {
  // Calculate task distribution by status
  const tasksByStatus = {
    'todo': tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    'review': tasks.filter(t => t.status === 'review').length,
    'completed': tasks.filter(t => t.status === 'completed').length
  };
  
  const totalTasks = tasks.length;
  
  // Calculate ratios
  const todoRatio = totalTasks ? tasksByStatus.todo / totalTasks : 0;
  const inProgressRatio = totalTasks ? tasksByStatus['in-progress'] / totalTasks : 0;
  const reviewRatio = totalTasks ? tasksByStatus.review / totalTasks : 0;
  const completedRatio = totalTasks ? tasksByStatus.completed / totalTasks : 0;
  
  // Calculate team load balance
  let teamLoadBalance = 0.5; // Default to middle value
  
  if (members.length > 0) {
    // Count tasks per team member
    const taskCounts = {};
    tasks.forEach(task => {
      const assigneeId = task.assignedTo ? task.assignedTo.toString() : 'unassigned';
      taskCounts[assigneeId] = (taskCounts[assigneeId] || 0) + 1;
    });
    
    // Calculate standard deviation of task counts
    const taskCountValues = Object.values(taskCounts);
    const mean = taskCountValues.reduce((sum, count) => sum + count, 0) / taskCountValues.length;
    const variance = taskCountValues.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / taskCountValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize to 0-1 scale (lower std dev = better balance = higher score)
    const maxPossibleStdDev = Math.sqrt(totalTasks); // Theoretical maximum standard deviation
    teamLoadBalance = maxPossibleStdDev > 0 ? 1 - (stdDev / maxPossibleStdDev) : 0.5;
  }
  
  return tf.tensor2d([
    [
      todoRatio,
      inProgressRatio,
      reviewRatio,
      completedRatio,
      teamLoadBalance
    ]
  ]);
}

/**
 * Analyze the current workflow and provide optimization recommendations using TensorFlow
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Workflow analysis and recommendations
 */
async function optimizeWorkflow(projectId) {
  console.log(`Optimizing workflow for project ID: ${projectId}`);
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.error(`Invalid project ID format: ${projectId}`);
      throw new Error('Invalid project ID format. Must be a valid MongoDB ObjectId');
    }
    
    // Get project data
    console.log('Fetching project data...');
    const project = await Project.findById(projectId);
    if (!project) {
      console.error(`Project not found with ID: ${projectId}`);
      throw new Error('Project not found');
    }
    console.log(`Found project: ${project.name}`);
    
    // Get tasks and team members
    console.log('Fetching tasks and team data...');
    const tasks = await Task.find({ project: projectId });
    console.log(`Found ${tasks.length} tasks`);
    
    const teamMembers = await User.find({
      _id: { $in: [...project.members, project.owner] }
    });
    console.log(`Found ${teamMembers.length} team members`);
    
    // Task distribution by status
    const tasksByStatus = {
      'todo': tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      'review': tasks.filter(t => t.status === 'review').length,
      'completed': tasks.filter(t => t.status === 'completed').length
    };
    console.log('Task distribution by status:', tasksByStatus);
    
    const totalTasks = tasks.length;
    const completedTasks = tasksByStatus.completed;
    const projectProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
    console.log(`Project progress: ${Math.round(projectProgress * 100)}%`);
    
    const daysRemaining = Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    console.log(`Days remaining until deadline: ${daysRemaining}`);
    
    // Task assignments per user
    const taskAssignments = {};
    teamMembers.forEach(member => {
      const memberTasks = tasks.filter(t => t.assignedTo && t.assignedTo.toString() === member._id.toString());
      taskAssignments[member._id] = {
        name: member.name,
        email: member.email,
        assignedTasks: memberTasks.length,
        todoTasks: memberTasks.filter(t => t.status === 'todo').length,
        inProgressTasks: memberTasks.filter(t => t.status === 'in-progress').length,
        reviewTasks: memberTasks.filter(t => t.status === 'review').length,
        completedTasks: memberTasks.filter(t => t.status === 'completed').length
      };
    });
    
    let bottleneckScores;
    let method = 'ml';
    
    // Make sure model is loaded - use TensorFlow if available
    if (useTensorFlow && workflowModel) {
      console.log('Using TensorFlow prediction model...');
      
      // Extract features
      const features = extractWorkflowFeatures(project, tasks, teamMembers);
      
      // Make prediction
      console.log('Running TensorFlow prediction for workflow optimization...');
      const prediction = workflowModel.predict(features);
      bottleneckScores = prediction.dataSync();
      
      // Cleanup tensors
      features.dispose();
      prediction.dispose();
    } else {
      console.log('Using heuristic fallback for workflow optimization...');
      method = 'heuristic';
      
      // Calculate bottleneck scores using heuristics
      const todoRatio = tasksByStatus.todo / totalTasks || 0;
      const inProgressRatio = tasksByStatus['in-progress'] / totalTasks || 0;
      const reviewRatio = tasksByStatus.review / totalTasks || 0;
      const completedRatio = tasksByStatus.completed / totalTasks || 0;
      
      // Calculate team load balance
      const assignedTaskCounts = Object.values(taskAssignments).map(member => member.assignedTasks);
      const maxTasks = Math.max(...assignedTaskCounts, 1);
      const minTasks = Math.min(...assignedTaskCounts, 0);
      const avgTasks = assignedTaskCounts.reduce((sum, count) => sum + count, 0) / teamMembers.length;
      const teamLoadBalance = maxTasks === minTasks ? 1 : 1 - ((maxTasks - avgTasks) / maxTasks);
      
      // Resource bottleneck score - higher means more severe bottleneck
      const resourceBottleneck = 1 - teamLoadBalance;
      
      // Task distribution score - higher means worse distribution
      const maxRatio = Math.max(todoRatio, inProgressRatio, reviewRatio);
      const taskDistributionScore = maxRatio > 0.5 ? 0.5 + maxRatio * 0.5 : maxRatio;
      
      // Workflow efficiency score - based on task progression
      const idealInProgressRatio = 0.3; // 30% of tasks should be in progress in a healthy project
      const idealReviewRatio = 0.2; // 20% of tasks should be in review in a healthy project
      const workflowEfficiency = Math.abs(inProgressRatio - idealInProgressRatio) + 
                                Math.abs(reviewRatio - idealReviewRatio);
      
      // Task dependency score - simplified for heuristic approach
      const taskDependencyScore = 0.5; // Default medium score since we can't easily determine this
      
      // Priority alignment score
      const highPriorityTasks = tasks.filter(t => t.priority === 'high');
      const highPriorityInProgress = highPriorityTasks.filter(t => t.status === 'in-progress').length;
      const priorityAlignmentScore = highPriorityTasks.length > 0 ? 
                                    1 - (highPriorityInProgress / highPriorityTasks.length) : 0;
      
      bottleneckScores = [
        resourceBottleneck,
        taskDistributionScore,
        workflowEfficiency,
        taskDependencyScore,
        priorityAlignmentScore
      ];
      
      console.log('Calculated heuristic bottleneck scores:', bottleneckScores);
    }
    
    // Create bottleneck analysis
    const bottleneckAnalysis = {
      resourceBottleneck: {
        score: bottleneckScores[0],
        level: getBottleneckLevel(bottleneckScores[0]),
        description: getResourceBottleneckDescription(bottleneckScores[0], taskAssignments)
      },
      taskDistribution: {
        score: bottleneckScores[1],
        level: getBottleneckLevel(bottleneckScores[1]),
        description: getTaskDistributionDescription(bottleneckScores[1], tasksByStatus)
      },
      workflowEfficiency: {
        score: bottleneckScores[2],
        level: getBottleneckLevel(bottleneckScores[2]),
        description: getWorkflowEfficiencyDescription(bottleneckScores[2], tasksByStatus)
      },
      taskDependency: {
        score: bottleneckScores[3],
        level: getBottleneckLevel(bottleneckScores[3]),
        description: "Task dependency analysis based on project structure"
      },
      priorityAlignment: {
        score: bottleneckScores[4],
        level: getBottleneckLevel(bottleneckScores[4]),
        description: getPriorityAlignmentDescription(bottleneckScores[4], tasks)
      }
    };
    
    // Generate optimization recommendations
    const recommendations = generateRecommendations(bottleneckAnalysis, tasks, taskAssignments);
    
    // Generate summary insights
    const insights = generateInsights(bottleneckAnalysis, tasksByStatus, daysRemaining, projectProgress);
    
    // Compose the result
    const result = {
      projectId,
      projectName: project.name,
      analysisDate: new Date().toISOString(),
      method,
      metrics: {
        taskDistribution: tasksByStatus,
        progress: projectProgress,
        daysRemaining,
        teamWorkload: taskAssignments
      },
      bottleneckAnalysis,
      recommendations,
      insights
    };
    
    return result;
  } catch (error) {
    console.error('Error in workflow optimization:', error);
    throw error;
  }
}

/**
 * Get the bottleneck level category based on score
 * @param {number} score - Bottleneck score (0-1)
 * @returns {string} Bottleneck level category
 */
function getBottleneckLevel(score) {
  if (score < 0.3) return 'low';
  if (score < 0.6) return 'medium';
  return 'high';
}

/**
 * Generate description for resource bottleneck
 * @param {number} score - Bottleneck score
 * @param {Object} taskAssignments - Task assignments by team member
 * @returns {string} Description of resource bottleneck
 */
function getResourceBottleneckDescription(score, taskAssignments) {
  const teamMembers = Object.values(taskAssignments);
  
  if (teamMembers.length === 0) {
    return "No team members found to analyze resource allocation.";
  }
  
  // Find the member with the most tasks
  const mostTasksMember = teamMembers.reduce((prev, current) => 
    (prev.assignedTasks > current.assignedTasks) ? prev : current
  );
  
  // Find the member with the least tasks
  const leastTasksMember = teamMembers.reduce((prev, current) => 
    (prev.assignedTasks < current.assignedTasks) ? prev : current
  );
  
  const taskDifference = mostTasksMember.assignedTasks - leastTasksMember.assignedTasks;
  
  if (score < 0.3) {
    return "Team workload is well balanced. No significant resource bottlenecks detected.";
  } else if (score < 0.6) {
    return `Moderate workload imbalance detected. ${mostTasksMember.name} has ${taskDifference} more tasks than ${leastTasksMember.name}.`;
  } else {
    return `Significant workload imbalance detected. ${mostTasksMember.name} has ${mostTasksMember.assignedTasks} tasks, which is ${taskDifference} more than ${leastTasksMember.name}.`;
  }
}

/**
 * Generate description for task distribution bottleneck
 * @param {number} score - Bottleneck score
 * @param {Object} tasksByStatus - Task counts by status
 * @returns {string} Description of task distribution bottleneck
 */
function getTaskDistributionDescription(score, tasksByStatus) {
  const totalTasks = Object.values(tasksByStatus).reduce((sum, count) => sum + count, 0);
  
  if (totalTasks === 0) {
    return "No tasks found to analyze distribution.";
  }
  
  const todoRatio = tasksByStatus.todo / totalTasks;
  const inProgressRatio = tasksByStatus['in-progress'] / totalTasks;
  const reviewRatio = tasksByStatus.review / totalTasks;
  
  if (score < 0.3) {
    return "Tasks are well distributed across different statuses.";
  } else if (score < 0.6) {
    // Find which status has the most tasks
    if (todoRatio > 0.5) {
      return `A large portion (${Math.round(todoRatio * 100)}%) of tasks are still in the 'To Do' state.`;
    } else if (inProgressRatio > 0.4) {
      return `Many tasks (${Math.round(inProgressRatio * 100)}%) are in the 'In Progress' state, which may indicate too many tasks being worked on simultaneously.`;
    } else if (reviewRatio > 0.3) {
      return `A significant number of tasks (${Math.round(reviewRatio * 100)}%) are in the 'Review' state, which may be creating a bottleneck.`;
    } else {
      return "Some task distribution issues detected but no major bottlenecks.";
    }
  } else {
    // Severe bottleneck
    if (todoRatio > 0.7) {
      return `Most tasks (${Math.round(todoRatio * 100)}%) are still in the 'To Do' state, indicating the project may be having trouble getting started.`;
    } else if (inProgressRatio > 0.6) {
      return `Too many tasks (${Math.round(inProgressRatio * 100)}%) are in the 'In Progress' state. The team may be spreading themselves too thin.`;
    } else if (reviewRatio > 0.5) {
      return `Many tasks (${Math.round(reviewRatio * 100)}%) are stuck in the 'Review' state, creating a major bottleneck.`;
    } else {
      return "Severe task distribution issues detected.";
    }
  }
}

/**
 * Generate description for workflow efficiency bottleneck
 * @param {number} score - Bottleneck score
 * @param {Object} tasksByStatus - Task counts by status
 * @returns {string} Description of workflow efficiency
 */
function getWorkflowEfficiencyDescription(score, tasksByStatus) {
  if (score < 0.3) {
    return "Workflow is operating efficiently with good progression of tasks through all stages.";
  } else if (score < 0.6) {
    return "Moderate inefficiencies detected in how tasks progress through workflow stages.";
  } else {
    const inProgressCount = tasksByStatus['in-progress'];
    const reviewCount = tasksByStatus.review;
    
    if (inProgressCount > reviewCount * 3) {
      return "Too many tasks are in progress simultaneously compared to tasks in review, suggesting potential context switching issues.";
    } else if (reviewCount > inProgressCount) {
      return "Tasks are getting stuck in review, creating a bottleneck in the workflow.";
    } else {
      return "Significant workflow inefficiencies detected that are impacting project progress.";
    }
  }
}

/**
 * Generate description for priority alignment issues
 * @param {number} score - Bottleneck score
 * @param {Array} tasks - Project tasks
 * @returns {string} Description of priority alignment issues
 */
function getPriorityAlignmentDescription(score, tasks) {
  const highPriorityTasks = tasks.filter(t => t.priority === 'high');
  const highPriorityTodoCount = highPriorityTasks.filter(t => t.status === 'todo').length;
  const highPriorityInProgressCount = highPriorityTasks.filter(t => t.status === 'in-progress').length;
  
  if (score < 0.3) {
    return "Task priorities are well aligned with current work. High-priority tasks are being addressed appropriately.";
  } else if (score < 0.6) {
    if (highPriorityTodoCount > highPriorityInProgressCount) {
      return `Some priority misalignment detected. ${highPriorityTodoCount} high-priority tasks are waiting to be worked on.`;
    } else {
      return "Some priority misalignment detected in how tasks are being worked on.";
    }
  } else {
    if (highPriorityTodoCount > highPriorityInProgressCount * 2) {
      return `Significant priority misalignment detected. ${highPriorityTodoCount} high-priority tasks are waiting to be worked on, but only ${highPriorityInProgressCount} are in progress.`;
    } else {
      return "Significant priority misalignment detected in how work is being prioritized.";
    }
  }
}

/**
 * Generate optimization recommendations based on bottleneck analysis
 * @param {Object} bottleneckAnalysis - Analysis of project bottlenecks
 * @param {Array} tasks - Project tasks
 * @param {Object} taskAssignments - Task assignments by team member
 * @returns {Array} List of optimization recommendations
 */
function generateRecommendations(bottleneckAnalysis, tasks, taskAssignments) {
  const recommendations = [];
  
  // Resource bottleneck recommendations
  if (bottleneckAnalysis.resourceBottleneck.level === 'high') {
    const overloadedMembers = Object.values(taskAssignments)
      .filter(member => member.assignedTasks > 5)
      .sort((a, b) => b.assignedTasks - a.assignedTasks);
    
    const underutilizedMembers = Object.values(taskAssignments)
      .filter(member => member.assignedTasks < 3)
      .sort((a, b) => a.assignedTasks - b.assignedTasks);
    
    if (overloadedMembers.length > 0 && underutilizedMembers.length > 0) {
      recommendations.push({
        type: 'resource',
        priority: 'high',
        description: `Redistribute tasks from ${overloadedMembers[0].name} (${overloadedMembers[0].assignedTasks} tasks) to ${underutilizedMembers[0].name} (${underutilizedMembers[0].assignedTasks} tasks)`,
        action: 'redistribute_tasks'
      });
    } else if (overloadedMembers.length > 0) {
      recommendations.push({
        type: 'resource',
        priority: 'high',
        description: `Consider adding more team members to help with the workload, as ${overloadedMembers[0].name} has ${overloadedMembers[0].assignedTasks} tasks assigned`,
        action: 'add_resources'
      });
    }
  } else if (bottleneckAnalysis.resourceBottleneck.level === 'medium') {
    recommendations.push({
      type: 'resource',
      priority: 'medium',
      description: 'Review task assignments to ensure balanced workload across team members',
      action: 'review_assignments'
    });
  }
  
  // Task distribution recommendations
  if (bottleneckAnalysis.taskDistribution.level === 'high') {
    if (bottleneckAnalysis.taskDistribution.description.includes('To Do')) {
      recommendations.push({
        type: 'workflow',
        priority: 'high',
        description: 'Start working on more tasks to move them from "To Do" to "In Progress"',
        action: 'start_tasks'
      });
    } else if (bottleneckAnalysis.taskDistribution.description.includes('In Progress')) {
      recommendations.push({
        type: 'workflow',
        priority: 'high',
        description: 'Focus on completing current in-progress tasks before starting new ones',
        action: 'complete_in_progress'
      });
    } else if (bottleneckAnalysis.taskDistribution.description.includes('Review')) {
      recommendations.push({
        type: 'workflow',
        priority: 'high',
        description: 'Dedicate time to review and complete tasks stuck in the review stage',
        action: 'review_tasks'
      });
    }
  }
  
  // Workflow efficiency recommendations
  if (bottleneckAnalysis.workflowEfficiency.level === 'high' || bottleneckAnalysis.workflowEfficiency.level === 'medium') {
    recommendations.push({
      type: 'process',
      priority: bottleneckAnalysis.workflowEfficiency.level,
      description: 'Implement daily stand-up meetings to improve workflow and identify blockers early',
      action: 'improve_communication'
    });
    
    if (bottleneckAnalysis.workflowEfficiency.description.includes('context switching')) {
      recommendations.push({
        type: 'process',
        priority: 'high',
        description: 'Limit work in progress (WIP) to reduce context switching and improve focus',
        action: 'limit_wip'
      });
    }
  }
  
  // Priority alignment recommendations
  if (bottleneckAnalysis.priorityAlignment.level === 'high' || bottleneckAnalysis.priorityAlignment.level === 'medium') {
    const highPriorityTodoTasks = tasks.filter(t => t.priority === 'high' && t.status === 'todo');
    
    if (highPriorityTodoTasks.length > 0) {
      recommendations.push({
        type: 'priority',
        priority: 'high',
        description: `Focus on the ${highPriorityTodoTasks.length} high-priority tasks that haven't been started yet`,
        action: 'focus_on_priorities'
      });
    }
  }
  
  // Add general recommendations if we have few specific ones
  if (recommendations.length < 2) {
    recommendations.push({
      type: 'general',
      priority: 'medium',
      description: 'Conduct a project retrospective to identify areas for workflow improvement',
      action: 'retrospective'
    });
  }
  
  return recommendations;
}

/**
 * Generate insights about the project based on analysis
 * @param {Object} bottleneckAnalysis - Analysis of project bottlenecks
 * @param {Object} tasksByStatus - Task counts by status
 * @param {number} daysRemaining - Days remaining until deadline
 * @param {number} projectProgress - Project progress as a ratio (0-1)
 * @returns {Array} List of insights about the project
 */
function generateInsights(bottleneckAnalysis, tasksByStatus, daysRemaining, projectProgress) {
  const insights = [];
  
  // Calculate expected progress based on time elapsed
  const expectedProgress = 1 - (daysRemaining / (daysRemaining + (projectProgress * daysRemaining / (1 - projectProgress))));
  
  // Project is behind schedule
  if (projectProgress < expectedProgress - 0.1) {
    insights.push({
      type: 'risk',
      description: `Project is behind schedule. Current progress is ${Math.round(projectProgress * 100)}% but expected progress is ${Math.round(expectedProgress * 100)}% based on time elapsed.`
    });
  } 
  // Project is ahead of schedule
  else if (projectProgress > expectedProgress + 0.1) {
    insights.push({
      type: 'positive',
      description: `Project is ahead of schedule. Current progress is ${Math.round(projectProgress * 100)}% while expected progress is ${Math.round(expectedProgress * 100)}% based on time elapsed.`
    });
  }
  
  // Too many tasks in progress
  if (tasksByStatus['in-progress'] > 10) {
    insights.push({
      type: 'risk',
      description: `Team is working on ${tasksByStatus['in-progress']} tasks simultaneously, which may lead to inefficiency and context switching.`
    });
  }
  
  // High number of bottlenecks detected
  const highBottlenecks = Object.values(bottleneckAnalysis).filter(b => b.level === 'high').length;
  if (highBottlenecks >= 2) {
    insights.push({
      type: 'risk',
      description: `Multiple high-level bottlenecks (${highBottlenecks}) detected, which may significantly impact project delivery.`
    });
  } else if (highBottlenecks === 0) {
    insights.push({
      type: 'positive',
      description: 'No high-level bottlenecks detected, indicating good project management practices.'
    });
  }
  
  // Deadline insights
  if (daysRemaining < 7 && projectProgress < 0.8) {
    insights.push({
      type: 'urgent',
      description: `Only ${daysRemaining} days remaining until deadline with ${Math.round(projectProgress * 100)}% completion. Deadline risk is high.`
    });
  } else if (daysRemaining < 14 && projectProgress < 0.6) {
    insights.push({
      type: 'risk',
      description: `${daysRemaining} days remaining until deadline with only ${Math.round(projectProgress * 100)}% completion. Consider scope adjustment or deadline extension.`
    });
  }
  
  return insights;
}

module.exports = {
  optimizeWorkflow,
  // Export for testing/training
  createAndTrainModel,
  saveModel
}; 