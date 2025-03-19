// const tf = require('@tensorflow/tfjs-node');
const Project = require('../../models/project');
const Task = require('../../models/task');
const User = require('../../models/user');

console.log('Task Suggestion Service loaded (simplified version)');

/**
 * Generate task suggestions for a project
 * @param {string} projectId - Project ID
 * @param {number} count - Number of tasks to suggest (default: 3)
 * @returns {Promise<Array>} Array of suggested tasks
 */
async function suggestTasks(projectId, count = 3) {
  console.log(`Suggesting ${count} tasks for project ID: ${projectId}`);
  try {
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
    
    // Define common task templates based on project type and status
    console.log('Defining task templates...');
    const taskTemplates = [
      { title: 'Create project documentation', priority: 'medium', status: 'todo' },
      { title: 'Set up development environment', priority: 'high', status: 'todo' },
      { title: 'Define project requirements', priority: 'high', status: 'todo' },
      { title: 'Create project timeline', priority: 'medium', status: 'todo' },
      { title: 'Set up communication channels', priority: 'medium', status: 'todo' },
      { title: 'Review requirements with stakeholders', priority: 'high', status: 'todo' },
      { title: 'Develop test plan', priority: 'medium', status: 'todo' },
      { title: 'Set up CI/CD pipeline', priority: 'medium', status: 'todo' },
      { title: 'Conduct user research', priority: 'high', status: 'todo' },
      { title: 'Create design mockups', priority: 'medium', status: 'todo' }
    ];
    
    // Filter out existing tasks
    console.log('Filtering out existing tasks...');
    const newTaskTemplates = taskTemplates.filter(task => 
      !existingTaskTitles.has(task.title.toLowerCase())
    );
    console.log(`${newTaskTemplates.length} new task templates available after filtering`);
    
    // If we have too few tasks after filtering, add generic tasks
    if (newTaskTemplates.length < count) {
      console.log('Adding generic tasks to meet suggestion count...');
      const genericTasks = [
        { title: `Project milestone ${existingTasks.length + 1}`, priority: 'high', status: 'todo' },
        { title: `Weekly team meeting ${Math.floor(Math.random() * 10) + 1}`, priority: 'medium', status: 'todo' },
        { title: `Review progress for week ${Math.floor(Math.random() * 10) + 1}`, priority: 'medium', status: 'todo' },
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
        createdBy: project.owner
      };
    });
    
    console.log(`Generated ${suggestedTasks.length} task suggestions for project ${project.name}`);
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
  suggestTasks
}; 