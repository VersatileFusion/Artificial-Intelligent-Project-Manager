# AI Project Manager | مدیریت پروژه هوشمند

[English](#english) | [فارسی](#persian)

<a name="english"></a>
## English

A comprehensive, intelligent project management platform that leverages artificial intelligence to enhance traditional project management processes. This system uses AI to provide smarter task estimation, workflow optimization, and resource management for teams of all sizes.

### Project Purpose

The AI Project Manager is designed to solve common project management challenges by applying artificial intelligence to:

1. **Reduce Project Delays**: Improve timeline estimation and early detection of potential blockers
2. **Optimize Resource Allocation**: Intelligently assign tasks based on team member workload and skills
3. **Enhance Decision Making**: Provide data-driven insights for project planning and execution
4. **Automate Routine Work**: Generate task suggestions and project documentation automatically
5. **Improve Visibility**: Offer predictive analytics on project health and potential risks

### Features

- **AI-Powered Task Estimation**: Predicts task completion time based on priority, status, and complexity
- **Smart Task Suggestions**: Automatically suggests relevant tasks based on project type and status
- **Workflow Optimization**: Analyzes project structure to suggest improvements in task sequencing and resource allocation
- **Project Timeline Prediction**: Forecasts project completion dates based on current progress and historical data
- **Role-Based Access Control**: Secure access management with different user roles (admin/user)
- **Robust Authentication**: JWT-based authentication with secure password handling
- **Input Validation**: Comprehensive validation for all data inputs to ensure integrity
- **Rate Limiting**: Protection against API abuse with customized rate limits for different endpoints
- **API Documentation**: Interactive Swagger documentation for all endpoints

### AI Capabilities

This platform implements advanced AI features using TensorFlow.js with a robust fallback mechanism:

#### TensorFlow Integration
- Neural network models for task duration prediction
- Machine learning classification for task suggestions
- Predictive analytics for workflow optimization
- Intelligent model loading and persistence

#### Graceful Fallback System
The platform includes a sophisticated fallback mechanism that ensures AI functionality remains available even when TensorFlow cannot be initialized:

- **Automatic Detection**: System automatically detects TensorFlow availability
- **Heuristic Alternatives**: Falls back to rule-based algorithms when ML models are unavailable
- **Consistent API**: Maintains the same API interface regardless of the prediction method
- **Method Transparency**: All predictions include a "method" field indicating whether ML or heuristic approaches were used

This dual-approach architecture ensures the platform remains functional across various environments and hardware configurations.

### Tech Stack

- **Backend**: Node.js with JavaScript
- **Package Manager**: pnpm
- **Database**: MongoDB with Mongoose
- **AI/ML**: TensorFlow.js with heuristic fallbacks
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- pnpm (v8 or higher)

### Installation

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

### TensorFlow.js on Windows

This project uses TensorFlow.js Node.js bindings which may require additional setup on Windows:

If you encounter issues with TensorFlow native bindings on Windows, you can:

1. Rebuild the addon from source:
```bash
npm rebuild @tensorflow/tfjs-node --build-addon-from-source
```

2. Or rely on the built-in heuristic fallbacks (no action needed)

### Project Structure

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

### API Documentation

The API documentation is available at `/api-docs` when running the server.

### AI Test Results

Below are the results from testing the AI features with TensorFlow fallback enabled:

#### Task Duration Prediction (Heuristic Fallback)
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

#### Task Suggestions (Heuristic Fallback)
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

### Development

#### Running Tests

```bash
# Run automated tests
pnpm test

# Test AI features with fallback
cd tests
node test-ai.js
```

#### Building for Production

```bash
pnpm build
```

#### Code Style

This project uses ESLint and Prettier for code formatting. Run the following command to format your code:

```bash
pnpm format
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the tools and libraries used in this project
- TensorFlow.js team for their excellent machine learning framework

---

<a name="persian"></a>
## فارسی

یک پلتفرم مدیریت پروژه هوشمند و جامع که از هوش مصنوعی برای بهبود فرآیندهای سنتی مدیریت پروژه استفاده می‌کند. این سیستم از هوش مصنوعی برای ارائه تخمین هوشمندانه‌تر وظایف، بهینه‌سازی گردش کار و مدیریت منابع برای تیم‌های با هر اندازه استفاده می‌کند.

### هدف پروژه

مدیریت پروژه هوشمند برای حل چالش‌های رایج مدیریت پروژه با استفاده از هوش مصنوعی طراحی شده است:

1. **کاهش تأخیرهای پروژه**: بهبود تخمین زمان‌بندی و تشخیص زودهنگام موانع احتمالی
2. **بهینه‌سازی تخصیص منابع**: اختصاص هوشمندانه وظایف بر اساس حجم کاری و مهارت‌های اعضای تیم
3. **ارتقاء تصمیم‌گیری**: ارائه بینش مبتنی بر داده برای برنامه‌ریزی و اجرای پروژه
4. **خودکارسازی کارهای روتین**: تولید خودکار پیشنهادات وظیفه و مستندات پروژه
5. **بهبود دید کلی**: ارائه تحلیل‌های پیش‌بینانه در مورد سلامت پروژه و ریسک‌های احتمالی

### ویژگی‌ها

- **تخمین وظایف با هوش مصنوعی**: پیش‌بینی زمان تکمیل وظیفه بر اساس اولویت، وضعیت و پیچیدگی
- **پیشنهادات هوشمند وظایف**: پیشنهاد خودکار وظایف مرتبط بر اساس نوع پروژه و وضعیت
- **بهینه‌سازی گردش کار**: تحلیل ساختار پروژه برای پیشنهاد بهبود در توالی وظایف و تخصیص منابع
- **پیش‌بینی زمان‌بندی پروژه**: پیش‌بینی تاریخ‌های تکمیل پروژه بر اساس پیشرفت فعلی و داده‌های تاریخی
- **کنترل دسترسی مبتنی بر نقش**: مدیریت امن دسترسی با نقش‌های کاربری مختلف (مدیر/کاربر)
- **احراز هویت قوی**: احراز هویت مبتنی بر JWT با مدیریت امن رمز عبور
- **اعتبارسنجی ورودی**: اعتبارسنجی جامع برای تمام داده‌های ورودی جهت تضمین یکپارچگی
- **محدودیت نرخ**: محافظت در برابر سوء استفاده از API با محدودیت‌های نرخ سفارشی برای نقاط پایانی مختلف
- **مستندات API**: مستندات تعاملی Swagger برای تمام نقاط پایانی

### قابلیت‌های هوش مصنوعی

این پلتفرم ویژگی‌های پیشرفته هوش مصنوعی را با استفاده از TensorFlow.js با یک مکانیسم فالبک قوی پیاده‌سازی می‌کند:

#### یکپارچه‌سازی TensorFlow
- مدل‌های شبکه عصبی برای پیش‌بینی مدت زمان وظیفه
- طبقه‌بندی یادگیری ماشین برای پیشنهادات وظیفه
- تحلیل‌های پیش‌بینانه برای بهینه‌سازی گردش کار
- بارگذاری و ذخیره‌سازی هوشمند مدل

#### سیستم فالبک کارآمد
این پلتفرم شامل یک مکانیسم فالبک پیشرفته است که اطمینان می‌دهد عملکرد هوش مصنوعی حتی زمانی که TensorFlow قابل راه‌اندازی نیست همچنان در دسترس باشد:

- **تشخیص خودکار**: سیستم به طور خودکار در دسترس بودن TensorFlow را تشخیص می‌دهد
- **جایگزین‌های ابتکاری**: در صورت عدم دسترسی به مدل‌های یادگیری ماشین، به الگوریتم‌های مبتنی بر قاعده برمی‌گردد
- **API یکپارچه**: رابط API یکسانی را بدون توجه به روش پیش‌بینی حفظ می‌کند
- **شفافیت روش**: تمام پیش‌بینی‌ها شامل یک فیلد "method" هستند که نشان می‌دهد از روش‌های ML یا ابتکاری استفاده شده است

این معماری دوگانه اطمینان می‌دهد که پلتفرم در محیط‌ها و پیکربندی‌های سخت‌افزاری مختلف عملکردی باقی می‌ماند.

### استک فنی

- **بک‌اند**: Node.js با JavaScript
- **مدیریت پکیج**: pnpm
- **پایگاه داده**: MongoDB با Mongoose
- **هوش مصنوعی/یادگیری ماشینی**: TensorFlow.js با فالبک‌های ابتکاری
- **احراز هویت**: JWT
- **مستندات API**: Swagger/OpenAPI

### پیش‌نیازها

- Node.js (نسخه 14 یا بالاتر)
- MongoDB (نسخه 4.4 یا بالاتر)
- pnpm (نسخه 8 یا بالاتر)

### نصب و راه‌اندازی

1. نصب pnpm (اگر قبلاً نصب نشده است):
```bash
npm install -g pnpm
```

2. کلون کردن مخزن:
```bash
git clone https://github.com/yourusername/ai-project-manager.git
cd ai-project-manager
```

3. نصب وابستگی‌ها:
```bash
pnpm install
```

4. ایجاد فایل `.env` در دایرکتوری ریشه و پیکربندی متغیرهای محیطی:
```bash
cp .env.example .env
```

5. شروع سرور توسعه:
```bash
pnpm dev
```

### TensorFlow.js در ویندوز

این پروژه از اتصالات Node.js مربوط به TensorFlow.js استفاده می‌کند که ممکن است نیاز به تنظیمات اضافی در ویندوز داشته باشد:

اگر با اتصالات بومی TensorFlow در ویندوز مشکل دارید، می‌توانید:

1. افزونه را از منبع بازسازی کنید:
```bash
npm rebuild @tensorflow/tfjs-node --build-addon-from-source
```

2. یا به فالبک‌های ابتکاری داخلی تکیه کنید (نیازی به اقدام نیست)

### ساختار پروژه

```
├── app.js              # نقطه ورود اصلی برنامه
├── config/             # فایل‌های پیکربندی
├── controllers/        # کنترلرهای مسیریابی
├── middleware/         # میان‌افزارهای سفارشی
│   ├── auth.js         # میان‌افزار احراز هویت
│   ├── error.js        # میان‌افزار مدیریت خطا
│   ├── rateLimiter.js  # محدودیت نرخ
│   └── validation.js   # اعتبارسنجی ورودی
├── models/             # مدل‌های MongoDB
│   ├── ai/             # ذخیره‌سازی مدل هوش مصنوعی
│   ├── project.js
│   ├── task.js
│   └── user.js
├── routes/             # مسیرهای API
│   ├── ai.js           # نقاط پایانی مرتبط با هوش مصنوعی
│   ├── auth.js         # نقاط پایانی احراز هویت
│   ├── projects.js
│   └── tasks.js
├── services/           # منطق کسب و کار
│   └── ai/             # سرویس‌های هوش مصنوعی
│       ├── durationPrediction.js
│       ├── taskSuggestion.js
│       └── workflowOptimization.js
├── tests/              # فایل‌های تست
└── utils/              # توابع کمکی
```

### مستندات API

مستندات API در هنگام اجرای سرور در آدرس `/api-docs` در دسترس است.

### نتایج تست هوش مصنوعی

در زیر نتایج حاصل از آزمایش ویژگی‌های هوش مصنوعی با فالبک TensorFlow فعال شده آمده است:

#### پیش‌بینی مدت زمان وظیفه (فالبک ابتکاری)
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

#### پیشنهادات وظیفه (فالبک ابتکاری)
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

### توسعه

#### اجرای تست‌ها

```bash
# اجرای تست‌های خودکار
pnpm test

# تست ویژگی‌های هوش مصنوعی با فالبک
cd tests
node test-ai.js
```

#### ساخت برای تولید

```bash
pnpm build
```

#### سبک کد

این پروژه از ESLint و Prettier برای قالب‌بندی کد استفاده می‌کند. برای قالب‌بندی کد خود، دستور زیر را اجرا کنید:

```bash
pnpm format
```

### مشارکت

1. Fork کردن مخزن
2. ایجاد شاخه ویژگی خود (`git checkout -b feature/amazing-feature`)
3. Commit کردن تغییرات خود (`git commit -m 'Add some amazing feature'`)
4. Push کردن به شاخه (`git push origin feature/amazing-feature`)
5. باز کردن یک Pull Request

لطفاً برای دستورالعمل‌های دقیق مشارکت به [CONTRIBUTING.md](CONTRIBUTING.md) مراجعه کنید.

### مجوز

این پروژه تحت مجوز MIT منتشر شده است - برای جزئیات، به فایل [LICENSE](LICENSE) مراجعه کنید.

### قدردانی

- از تمام مشارکت‌کنندگانی که به شکل دادن این پروژه کمک کرده‌اند، سپاسگزاریم
- تشکر ویژه از جامعه متن‌باز برای ابزارها و کتابخانه‌های استفاده شده در این پروژه
- تیم TensorFlow.js برای چارچوب عالی یادگیری ماشین

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

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the tools and libraries used in this project
- TensorFlow.js team for their excellent machine learning framework 