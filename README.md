# AI Project Manager

A comprehensive, intelligent project management platform that leverages artificial intelligence to enhance traditional project management processes. This system uses AI to provide smarter task estimation, workflow optimization, and resource management for teams of all sizes.

## Project Purpose

The AI Project Manager is designed to solve common project management challenges by applying artificial intelligence to:

1. **Reduce Project Delays**: Improve timeline estimation and early detection of potential blockers
2. **Optimize Resource Allocation**: Intelligently assign tasks based on team member workload and skills
3. **Enhance Decision Making**: Provide data-driven insights for project planning and execution
4. **Automate Routine Work**: Generate task suggestions and project documentation automatically
5. **Improve Visibility**: Offer predictive analytics on project health and potential risks

## Features

- **AI-Powered Task Estimation**: Predicts task completion time based on priority, status, and complexity
- **Smart Task Suggestions**: Automatically suggests relevant tasks based on project type and status
- **Workflow Optimization**: Analyzes project structure to suggest improvements in task sequencing and resource allocation
- **Project Timeline Prediction**: Forecasts project completion dates based on current progress and historical data
- **Role-Based Access Control**: Secure access management with different user roles (admin/user)
- **Robust Authentication**: JWT-based authentication with secure password handling
- **Input Validation**: Comprehensive validation for all data inputs to ensure integrity
- **Rate Limiting**: Protection against API abuse with customized rate limits for different endpoints
- **API Documentation**: Interactive Swagger documentation for all endpoints

## AI Capabilities

This platform implements advanced AI features using TensorFlow.js with a robust fallback mechanism:

### TensorFlow Integration
- Neural network models for task duration prediction
- Machine learning classification for task suggestions
- Predictive analytics for workflow optimization
- Intelligent model loading and persistence

### Graceful Fallback System
The platform includes a sophisticated fallback mechanism that ensures AI functionality remains available even when TensorFlow cannot be initialized:

- **Automatic Detection**: System automatically detects TensorFlow availability
- **Heuristic Alternatives**: Falls back to rule-based algorithms when ML models are unavailable
- **Consistent API**: Maintains the same API interface regardless of the prediction method
- **Method Transparency**: All predictions include a "method" field indicating whether ML or heuristic approaches were used

This dual-approach architecture ensures the platform remains functional across various environments and hardware configurations.

## Tech Stack

- **Backend**: Node.js with JavaScript
- **Package Manager**: pnpm
- **Database**: MongoDB with Mongoose
- **AI/ML**: TensorFlow.js with heuristic fallbacks
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- pnpm (v8 or higher)

## Installation

1. Install pnpm (if not already installed):
```bash
npm install -g pnpm
```

2. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-project-manager.git
cd ai-project-manager
```

3. Install dependencies:
```bash
pnpm install
```

4. Create a `.env` file in the root directory and configure your environment variables:
```bash
cp .env.example .env
```

5. Start the development server:
```bash
pnpm dev
```

## TensorFlow.js on Windows

This project uses TensorFlow.js Node.js bindings which may require additional setup on Windows:

If you encounter issues with TensorFlow native bindings on Windows, you can:

1. Rebuild the addon from source:
```bash
npm rebuild @tensorflow/tfjs-node --build-addon-from-source
```

2. Or rely on the built-in heuristic fallbacks (no action needed)

## Project Structure

```
├── app.js              # Main application entry point
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── error.js        # Error handling middleware
│   ├── rateLimiter.js  # Rate limiting
│   └── validation.js   # Input validation
├── models/             # MongoDB models
│   ├── ai/             # AI model storage
│   ├── project.js
│   ├── task.js
│   └── user.js
├── routes/             # API routes
│   ├── ai.js           # AI-related endpoints
│   ├── auth.js         # Authentication endpoints
│   ├── projects.js
│   └── tasks.js
├── services/           # Business logic
│   └── ai/             # AI services
│       ├── durationPrediction.js
│       ├── taskSuggestion.js
│       └── workflowOptimization.js
├── tests/              # Test files
└── utils/              # Utility functions
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## AI Test Results

Below are the results from testing the AI features with TensorFlow fallback enabled:

### Task Duration Prediction (Heuristic Fallback)
```
{
  "taskId": "67db20d644d29d5e65762d27",
  "taskTitle": "Test Task",
  "predictedDays": 3,
  "bestCase": 2.1,
  "worstCase": 4.5,
  "estimatedCompletionDate": "2025-03-22",
  "confidence": 0.75,
  "method": "heuristic"
}
```

### Task Suggestions (Heuristic Fallback)
```
[
  {
    "title": "Define project scope",
    "priority": "high",
    "category": "planning",
    "description": "AI-suggested task: Define project scope for project \"Test Project\"",
    "confidence": "100.00",
    "method": "heuristic"
  },
  {
    "title": "Create project timeline",
    "priority": "high",
    "category": "planning",
    "description": "AI-suggested task: Create project timeline for project \"Test Project\"",
    "confidence": "100.00",
    "method": "heuristic"
  }
]
```

## Development

### Running Tests

```bash
# Run automated tests
pnpm test

# Test AI features with fallback
cd tests
node test-ai.js
```

### Building for Production

```bash
pnpm build
```

### Code Style

This project uses ESLint and Prettier for code formatting. Run the following command to format your code:

```bash
pnpm format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Author**: Erfan Ahmadvand
- **Phone**: +989109924707
- **GitHub**: [Erfan Ahmadvand](https://github.com/erfan)

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the tools and libraries used in this project
- TensorFlow.js team for their excellent machine learning framework 