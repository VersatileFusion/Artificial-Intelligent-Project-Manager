const express = require('express');
const router = express.Router();

// Import AI services
const { suggestTasks } = require('../services/ai/taskSuggestion');
const { predictTaskDuration, predictProjectTimeline } = require('../services/ai/durationPrediction');
const { optimizeWorkflow } = require('../services/ai/workflowOptimization');

console.log('AI routes initialized (simplified version without TensorFlow)');

/**
 * @swagger
 * /api/ai/tasks/suggest/{projectId}:
 *   get:
 *     summary: Get AI-suggested tasks for a project
 *     description: Uses heuristics to suggest new tasks for a project based on its current state
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of tasks to suggest
 *     responses:
 *       200:
 *         description: List of suggested tasks
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/tasks/suggest/:projectId', async (req, res) => {
  console.log(`Received request to suggest tasks for project: ${req.params.projectId}`);
  try {
    const count = parseInt(req.query.count) || 3;
    const suggestions = await suggestTasks(req.params.projectId, count);
    console.log(`Returning ${suggestions.length} task suggestions`);
    res.json(suggestions);
  } catch (error) {
    console.error('Error in task suggestion endpoint:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error generating task suggestions', error: error.message });
  }
});

/**
 * @swagger
 * /api/ai/tasks/duration/{taskId}:
 *   get:
 *     summary: Predict the duration of a task
 *     description: Uses heuristics to predict how long a task will take to complete
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task duration prediction
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/tasks/duration/:taskId', async (req, res) => {
  console.log(`Received request to predict duration for task: ${req.params.taskId}`);
  try {
    const prediction = await predictTaskDuration(req.params.taskId);
    console.log(`Returning duration prediction for task ${req.params.taskId}`);
    res.json(prediction);
  } catch (error) {
    console.error('Error in task duration prediction endpoint:', error);
    if (error.message === 'Task not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error predicting task duration', error: error.message });
  }
});

/**
 * @swagger
 * /api/ai/projects/timeline/{projectId}:
 *   get:
 *     summary: Predict the timeline for a project
 *     description: Uses heuristics to predict completion dates for all tasks in a project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project timeline prediction
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/projects/timeline/:projectId', async (req, res) => {
  console.log(`Received request to predict timeline for project: ${req.params.projectId}`);
  try {
    const timeline = await predictProjectTimeline(req.params.projectId);
    console.log(`Returning timeline prediction with ${timeline.length} tasks for project ${req.params.projectId}`);
    res.json(timeline);
  } catch (error) {
    console.error('Error in project timeline prediction endpoint:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error predicting project timeline', error: error.message });
  }
});

/**
 * @swagger
 * /api/ai/projects/optimize/{projectId}:
 *   get:
 *     summary: Get workflow optimization recommendations
 *     description: Uses heuristics to analyze the project workflow and suggest optimizations
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Workflow optimization recommendations
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/projects/optimize/:projectId', async (req, res) => {
  console.log(`Received request to optimize workflow for project: ${req.params.projectId}`);
  try {
    const optimization = await optimizeWorkflow(req.params.projectId);
    console.log(`Returning workflow optimization with ${optimization.recommendations.length} recommendations`);
    res.json(optimization);
  } catch (error) {
    console.error('Error in workflow optimization endpoint:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error optimizing workflow', error: error.message });
  }
});

module.exports = router; 