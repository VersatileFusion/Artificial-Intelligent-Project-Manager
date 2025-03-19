const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Project Manager API',
      version: '1.0.0',
      description: 'REST API for AI-powered project management platform',
      contact: {
        name: 'API Support',
        email: 'support@aiprojectmanager.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Project: {
          type: 'object',
          required: ['name', 'description', 'startDate', 'endDate', 'owner'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID',
            },
            name: {
              type: 'string',
              description: 'Project name',
            },
            description: {
              type: 'string',
              description: 'Project description',
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Project start date',
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Project end date',
            },
            status: {
              type: 'string',
              enum: ['planning', 'in-progress', 'completed', 'on-hold'],
              description: 'Current project status',
            },
            owner: {
              type: 'string',
              description: 'User ID of project owner',
            },
            members: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of user IDs of team members',
            },
          },
        },
        Task: {
          type: 'object',
          required: ['title', 'description', 'dueDate', 'project', 'assignedTo', 'createdBy'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID',
            },
            title: {
              type: 'string',
              description: 'Task title',
            },
            description: {
              type: 'string',
              description: 'Task description',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'review', 'completed'],
              description: 'Current task status',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Task priority',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Task due date',
            },
            project: {
              type: 'string',
              description: 'Project ID that this task belongs to',
            },
            assignedTo: {
              type: 'string',
              description: 'User ID of person assigned to the task',
            },
            createdBy: {
              type: 'string',
              description: 'User ID of task creator',
            },
          },
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated MongoDB ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              description: 'User password (hashed)',
              writeOnly: true,
            },
          },
        },
        TaskSuggestion: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Suggested task title',
            },
            description: {
              type: 'string',
              description: 'Auto-generated task description',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Suggested priority level',
            },
            status: {
              type: 'string',
              enum: ['todo'],
              description: 'Initial task status (always todo)',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'AI-calculated due date',
            },
            project: {
              type: 'string',
              description: 'Project ID',
            },
            assignedTo: {
              type: 'string',
              description: 'AI-recommended team member for the task',
            },
            createdBy: {
              type: 'string',
              description: 'Project owner ID',
            },
          },
        },
        DurationPrediction: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Task ID',
            },
            taskTitle: {
              type: 'string',
              description: 'Task title',
            },
            predictedDays: {
              type: 'number',
              description: 'Predicted days to complete',
            },
            bestCase: {
              type: 'number',
              description: 'Best case scenario (days)',
            },
            worstCase: {
              type: 'number',
              description: 'Worst case scenario (days)',
            },
            estimatedCompletionDate: {
              type: 'string',
              format: 'date',
              description: 'Estimated completion date',
            },
            confidence: {
              type: 'number',
              description: 'Confidence score (0-1)',
            },
          },
        },
        WorkflowOptimization: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID',
            },
            projectName: {
              type: 'string',
              description: 'Project name',
            },
            metrics: {
              type: 'object',
              description: 'Key project metrics',
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Recommendation type',
                  },
                  title: {
                    type: 'string',
                    description: 'Recommendation title',
                  },
                  description: {
                    type: 'string',
                    description: 'Detailed description',
                  },
                  details: {
                    type: 'object',
                    description: 'Additional details for the recommendation',
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: 'Recommendation priority',
                  },
                },
              },
              description: 'List of workflow optimization recommendations',
            },
            generatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when analysis was generated',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './app.js'],
};

const specs = swaggerJsDoc(options);

module.exports = specs; 