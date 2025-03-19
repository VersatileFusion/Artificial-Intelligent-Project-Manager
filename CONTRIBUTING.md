# Contributing to AI Project Manager

Thank you for considering contributing to the AI Project Manager! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [AI Feature Contributions](#ai-feature-contributions)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the problem
- Describe the expected behavior and what actually happened
- Include screenshots if applicable

### Suggesting Enhancements

- Use the feature request template when suggesting enhancements
- Clearly describe the feature and its benefits
- Provide examples of how the feature would be used
- Consider including mockups or diagrams

### Code Contributions

We welcome code contributions for:

- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- AI model enhancements

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/ai-project-manager.git`
3. Install dependencies: `pnpm install`
4. Create a `.env` file based on `.env.example`
5. Run the development server: `pnpm dev`

## Pull Request Process

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them with clear, descriptive messages
3. Push your branch to your fork: `git push origin feature/your-feature-name`
4. Create a pull request against the main repository's `main` branch
5. Ensure your PR description clearly describes the changes and references any related issues
6. Wait for review and address any feedback

## Coding Guidelines

### JavaScript Style Guide

- Use the configured ESLint and Prettier settings
- Run `pnpm format` before submitting your PR
- Follow the existing code style in the project
- Use meaningful variable and function names
- Include JSDoc comments for functions and complex code blocks

### Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Run `pnpm test` to execute the test suite

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in the present tense (Add, Fix, Update, etc.)
- Reference issue numbers when applicable
- Keep commits focused on a single change

Example:
```
Fix: Prevent task duration prediction from crashing when TensorFlow is unavailable (#123)
```

## AI Feature Contributions

When contributing to AI-related features:

### TensorFlow Integration

- Always include graceful fallbacks for TensorFlow features
- Test with both TensorFlow available and unavailable scenarios
- Document model architecture and training approach
- Consider model size and performance implications

### Heuristic Fallbacks

- Implement rule-based alternatives when adding new ML features
- Ensure consistent API interfaces between ML and heuristic methods
- Include the `method` field in all AI-related responses
- Document the heuristic approach used

### Model Performance

- Include benchmarks for model performance when possible
- Consider both accuracy and computational efficiency
- Test on a variety of data scenarios

## Documentation

- Update the README.md with details of significant changes
- Document new features, especially AI capabilities
- Update API documentation and Swagger definitions
- Add examples for new functionality

---

Thank you for contributing to the AI Project Manager! Your efforts help make this project better for everyone. 