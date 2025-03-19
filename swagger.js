const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Project Manager API',
      version: '1.0.0',
      description: 'REST API for AI-powered project management platform with TensorFlow ML models and graceful fallbacks to heuristic algorithms when TensorFlow is unavailable.',
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
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer {token}'
        }
      },
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
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              description: 'User role for authorization',
            },
          },
        },
        Auth: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token',
            },
            user: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string',
                  description: 'User ID',
                },
                name: {
                  type: 'string',
                  description: 'User name',
                },
                email: {
                  type: 'string',
                  description: 'User email',
                },
                role: {
                  type: 'string',
                  description: 'User role',
                },
              },
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
            confidence: {
              type: 'string',
              description: 'Confidence score for the suggestion (0-100)',
            },
            method: {
              type: 'string',
              enum: ['ml', 'heuristic'],
              description: 'Method used for suggestion (ml = TensorFlow ML, heuristic = rule-based fallback)',
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
            method: {
              type: 'string',
              enum: ['ml', 'heuristic'],
              description: 'Method used for prediction (ml = TensorFlow ML, heuristic = rule-based fallback)',
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
            method: {
              type: 'string',
              enum: ['ml', 'heuristic'],
              description: 'Method used for optimization (ml = TensorFlow ML, heuristic = rule-based fallback)',
            },
          },
        },
        ProjectTimeline: {
          type: 'array',
          items: {
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
              estimatedCompletionDate: {
                type: 'string',
                format: 'date',
                description: 'Estimated completion date',
              },
              confidence: {
                type: 'number',
                description: 'Confidence score (0-1)',
              },
              method: {
                type: 'string',
                enum: ['ml', 'heuristic'],
                description: 'Method used for prediction (ml = TensorFlow ML, heuristic = rule-based fallback)',
              },
            },
          },
          description: 'Timeline predictions for all tasks in a project',
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Operation success status',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (only in development)',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Projects',
        description: 'Project management endpoints'
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints'
      },
      {
        name: 'AI',
        description: 'Artificial Intelligence features with TensorFlow ML (with automatic fallback to heuristic algorithms when TensorFlow is unavailable)'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      }
    ],
  },
  apis: ['./routes/*.js', './app.js'],
};

const specs = swaggerJsDoc(options);

module.exports = specs; 