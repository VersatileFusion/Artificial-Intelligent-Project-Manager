// const tf = require('@tensorflow/tfjs-node');
const Task = require('../../models/task');
const Project = require('../../models/project');
const User = require('../../models/user');

console.log('Workflow Optimization Service loaded (simplified version)');

/**
 * Analyze the current workflow and provide optimization recommendations
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Workflow analysis and recommendations
 */
async function optimizeWorkflow(projectId) {
  console.log(`Optimizing workflow for project ID: ${projectId}`);
  try {
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
    
    // Calculate key workflow metrics
    console.log('Calculating workflow metrics...');
    
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
    tasks.forEach(task => {
      const assigneeId = task.assignedTo ? task.assignedTo.toString() : 'unassigned';
      if (!taskAssignments[assigneeId]) {
        taskAssignments[assigneeId] = [];
      }
      taskAssignments[assigneeId].push(task);
    });
    
    // Calculate workload metrics
    console.log('Analyzing team workload distribution...');
    const avgTasksPerMember = totalTasks / Math.max(1, teamMembers.length);
    console.log(`Average tasks per team member: ${avgTasksPerMember.toFixed(1)}`);
    
    // Find overloaded and underloaded team members
    const overloadedMembers = [];
    const underloadedMembers = [];
    
    teamMembers.forEach(member => {
      const memberId = member._id.toString();
      const assignedTasks = taskAssignments[memberId] || [];
      
      console.log(`Team member: ${member.name || 'Unknown'}, Tasks assigned: ${assignedTasks.length}`);
      
      if (assignedTasks.length > avgTasksPerMember * 1.5) {
        overloadedMembers.push({
          id: memberId,
          name: member.name || 'Unknown',
          taskCount: assignedTasks.length
        });
      } else if (assignedTasks.length < avgTasksPerMember * 0.5) {
        underloadedMembers.push({
          id: memberId,
          name: member.name || 'Unknown',
          taskCount: assignedTasks.length
        });
      }
    });
    
    console.log(`Overloaded team members: ${overloadedMembers.length}`);
    console.log(`Underloaded team members: ${underloadedMembers.length}`);
    
    // Generate recommendations
    console.log('Generating workflow recommendations...');
    const recommendations = [];
    
    // 1. Task redistribution recommendation
    if (overloadedMembers.length > 0 && underloadedMembers.length > 0) {
      console.log('Adding task redistribution recommendation...');
      recommendations.push({
        type: 'task_redistribution',
        title: 'Redistribute Tasks',
        description: `Redistribute tasks from overloaded team members to those with lighter workloads.`,
        details: {
          overloadedMembers,
          underloadedMembers
        },
        priority: 'high'
      });
    }
    
    // 2. Timeline recommendation
    const projectDuration = (new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24);
    const elapsedDuration = (new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24);
    const expectedProgress = Math.min(1, elapsedDuration / projectDuration);
    console.log(`Expected progress based on timeline: ${Math.round(expectedProgress * 100)}%`);
    
    const onTrack = projectProgress >= expectedProgress * 0.9; // Allow 10% buffer
    if (!onTrack) {
      console.log('Adding timeline adjustment recommendation...');
      recommendations.push({
        type: 'timeline_adjustment',
        title: 'Adjust Project Timeline',
        description: `Project is behind schedule. Consider extending the deadline or reducing scope.`,
        details: {
          currentProgress: `${Math.round(projectProgress * 100)}%`,
          expectedProgress: `${Math.round(expectedProgress * 100)}%`,
          daysRemaining
        },
        priority: 'high'
      });
    }
    
    // 3. Task prioritization recommendation
    const highPriorityTodos = tasks.filter(t => t.priority === 'high' && t.status === 'todo').length;
    if (highPriorityTodos > 0) {
      console.log('Adding task prioritization recommendation...');
      recommendations.push({
        type: 'prioritization',
        title: 'Focus on High Priority Tasks',
        description: `There are ${highPriorityTodos} high priority tasks still in the backlog.`,
        details: {
          highPriorityTodos
        },
        priority: 'medium'
      });
    }
    
    // 4. Resource allocation recommendation
    const inProgressTasks = tasksByStatus['in-progress'];
    if (inProgressTasks > teamMembers.length * 2) {
      console.log('Adding resource allocation recommendation...');
      recommendations.push({
        type: 'resource_allocation',
        title: 'Too Many Parallel Tasks',
        description: `The team has too many tasks in progress simultaneously.`,
        details: {
          inProgressTasks,
          recommendedMaximum: teamMembers.length * 2
        },
        priority: 'medium'
      });
    }
    
    // 5. Bottleneck identification
    const reviewTasks = tasksByStatus.review;
    if (reviewTasks > teamMembers.length) {
      console.log('Adding bottleneck identification recommendation...');
      recommendations.push({
        type: 'bottleneck',
        title: 'Review Process Bottleneck',
        description: `Too many tasks are stuck in the review stage.`,
        details: {
          reviewTasks,
          recommendation: 'Allocate more resources to reviewing tasks'
        },
        priority: 'medium'
      });
    }
    
    // Return comprehensive analysis
    const analysis = {
      projectId,
      projectName: project.name,
      metrics: {
        taskDistribution: tasksByStatus,
        progress: Math.round(projectProgress * 100),
        daysRemaining,
        teamSize: teamMembers.length,
        workloadBalance: overloadedMembers.length === 0 && underloadedMembers.length === 0 ? 100 : 
          Math.max(0, 100 - ((overloadedMembers.length + underloadedMembers.length) * 10))
      },
      recommendations,
      generatedAt: new Date().toISOString()
    };
    
    console.log('Workflow optimization completed');
    console.log(`Generated ${recommendations.length} recommendations`);
    
    return analysis;
  } catch (error) {
    console.error('Error optimizing workflow:', error);
    throw error;
  }
}

module.exports = {
  optimizeWorkflow
}; 