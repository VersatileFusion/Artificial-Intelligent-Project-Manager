# TensorFlow Fallback Mechanism

This document provides technical details about the TensorFlow.js fallback mechanism implemented in the AI Project Manager platform.

## Overview

The AI Project Manager uses TensorFlow.js for machine learning capabilities including task duration prediction, task suggestion, and workflow optimization. To ensure the platform remains functional across all environments, we've implemented a robust fallback system that automatically switches to rule-based heuristic algorithms when TensorFlow isn't available.

## Implementation Details

### Detection Mechanism

In each AI service module, the system attempts to load TensorFlow and sets a flag based on the outcome:

```javascript
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
```

### Model Loading

The `loadOrCreateModel` function in each AI service checks the availability flag before attempting to load models:

```javascript
async function loadOrCreateModel() {
  // If TensorFlow is not available, return null
  if (!useTensorFlow) {
    console.log('TensorFlow not available, skipping model loading');
    return null;
  }
  
  try {
    // Proceed with model loading...
  } catch (error) {
    // Handle errors...
  }
}
```

### Fallback Implementation

Each AI function checks for TensorFlow availability and models before determining which approach to use:

```javascript
if (useTensorFlow && durationModel) {
  // Use TensorFlow ML approach
  // ...
} else {
  // Use heuristic fallback
  // ...
}
```

### API Consistency

Both approaches maintain identical API responses, with a `method` field indicating which approach was used:

```javascript
return {
  taskId: task._id,
  taskTitle: task.title,
  predictedDays: predictedDays,
  bestCase: bestCase,
  worstCase: worstCase,
  estimatedCompletionDate: estimatedCompletionDate.toISOString().split('T')[0],
  confidence: 0.75,
  method: 'heuristic' // or 'ml' when using TensorFlow
};
```

## Heuristic Algorithms

### Task Duration Prediction

When TensorFlow is unavailable, the system uses a rule-based approach:

1. Base predictions on task priority:
   - High priority: 3 days
   - Medium priority: 5 days
   - Low priority: 7 days

2. Adjust based on status:
   - In-progress: 30% reduction
   - Review: 70% reduction

```javascript
// Base duration based on priority
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
  adjustedPrediction *= 0.7; // 30% less time if already started
} else if (task.status === 'review') {
  adjustedPrediction *= 0.3; // 70% less time if in review
}
```

### Task Suggestions

The heuristic task suggestion algorithm uses:

1. Keyword matching against project descriptions and names
2. Analysis of existing task distribution
3. Pre-defined templates based on project categories
4. Task filtering to avoid duplicates

```javascript
// Count occurrences of category-related keywords
const scores = {};
for (const [category, keywords] of Object.entries(categoryKeywords)) {
  scores[category] = keywords.reduce((score, keyword) => {
    const nameMatches = (projectName.match(new RegExp(keyword, 'g')) || []).length;
    const descMatches = (projectDescription.match(new RegExp(keyword, 'g')) || []).length;
    return score + nameMatches * 2 + descMatches;
  }, 0);
}

// Find the category with the highest score
let highestScore = 0;
for (const [category, score] of Object.entries(scores)) {
  if (score > highestScore) {
    highestScore = score;
    predictedCategory = category;
  }
}
```

### Workflow Optimization

The workflow optimization fallback uses statistical analysis to identify:

1. Resource bottlenecks based on team member workload distribution
2. Task distribution imbalances across different status categories
3. Workflow efficiency based on deviation from ideal task distributions
4. Priority alignment issues based on high-priority task handling

```javascript
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
```

## Testing

Both the ML-based and heuristic-based approaches can be tested using the provided test script:

```bash
cd tests
node test-ai.js
```

This script will:
1. Create a test project
2. Add a test task
3. Run all AI functions
4. Display the results, including which method was used

## Extending the System

When adding new AI features:

1. Always implement both TensorFlow and heuristic approaches
2. Maintain API consistency between both methods
3. Include the `method` field in responses
4. Add appropriate logging for troubleshooting

## Common Issues

### TensorFlow Native Binding Issues on Windows

Windows users commonly encounter issues with TensorFlow.js native bindings. The error message typically looks like:

```
TensorFlow initialization failed, using heuristic fallback instead:
The Node.js native addon module (tfjs_binding.node) can not be found at path: .../tfjs-node/lib/napi-v8/tfjs_binding.node
```

This is automatically handled by the fallback system, but users can also try:

```bash
npm rebuild @tensorflow/tfjs-node --build-addon-from-source
```

### Docker Environment

When using Docker, ensure the container has the necessary dependencies for TensorFlow.js. The fallback system ensures functionality even without these dependencies. 