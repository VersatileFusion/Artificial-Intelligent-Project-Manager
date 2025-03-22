# Contributing to AI Project Manager | مشارکت در مدیریت پروژه هوشمند

[English](#english) | [فارسی](#persian)

<a name="english"></a>
## English

Thank you for considering contributing to the AI Project Manager! This document provides guidelines and instructions for contributing to this project.

### Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [AI Feature Contributions](#ai-feature-contributions)

### Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### How Can I Contribute?

#### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the problem
- Describe the expected behavior and what actually happened
- Include screenshots if applicable

#### Suggesting Enhancements

- Use the feature request template when suggesting enhancements
- Clearly describe the feature and its benefits
- Provide examples of how the feature would be used
- Consider including mockups or diagrams

#### Code Contributions

We welcome code contributions for:

- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- AI model enhancements

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/ai-project-manager.git`
3. Install dependencies: `pnpm install`
4. Create a `.env` file based on `.env.example`
5. Run the development server: `pnpm dev`

### Pull Request Process

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them with clear, descriptive messages
3. Push your branch to your fork: `git push origin feature/your-feature-name`
4. Create a pull request against the main repository's `main` branch
5. Ensure your PR description clearly describes the changes and references any related issues
6. Wait for review and address any feedback

### Coding Guidelines

#### JavaScript Style Guide

- Use the configured ESLint and Prettier settings
- Run `pnpm format` before submitting your PR
- Follow the existing code style in the project
- Use meaningful variable and function names
- Include JSDoc comments for functions and complex code blocks

#### Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Run `pnpm test` to execute the test suite

#### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in the present tense (Add, Fix, Update, etc.)
- Reference issue numbers when applicable
- Keep commits focused on a single change

Example:
```
Fix: Prevent task duration prediction from crashing when TensorFlow is unavailable (#123)
```

### AI Feature Contributions

When contributing to AI-related features:

#### TensorFlow Integration

- Always include graceful fallbacks for TensorFlow features
- Test with both TensorFlow available and unavailable scenarios
- Document model architecture and training approach
- Consider model size and performance implications

#### Heuristic Fallbacks

- Implement rule-based alternatives when adding new ML features
- Ensure consistent API interfaces between ML and heuristic methods
- Include the `method` field in all AI-related responses
- Document the heuristic approach used

#### Model Performance

- Include benchmarks for model performance when possible
- Consider both accuracy and computational efficiency
- Test on a variety of data scenarios

### Documentation

- Update the README.md with details of significant changes
- Document new features, especially AI capabilities
- Update API documentation and Swagger definitions
- Add examples for new functionality

---

Thank you for contributing to the AI Project Manager! Your efforts help make this project better for everyone.

<a name="persian"></a>
## فارسی

با تشکر از در نظر گرفتن مشارکت در مدیریت پروژه هوشمند! این سند راهنما و دستورالعمل‌هایی برای مشارکت در این پروژه ارائه می‌دهد.

### فهرست مطالب

- [آیین نامه رفتاری](#آیین-نامه-رفتاری)
- [چگونه می‌توانم مشارکت کنم؟](#چگونه-می‌توانم-مشارکت-کنم)
- [تنظیمات توسعه](#تنظیمات-توسعه)
- [فرآیند درخواست ادغام](#فرآیند-درخواست-ادغام)
- [راهنمای کدنویسی](#راهنمای-کدنویسی)
- [مشارکت در ویژگی‌های هوش مصنوعی](#مشارکت-در-ویژگی‌های-هوش-مصنوعی)

### آیین نامه رفتاری

این پروژه و همه افرادی که در آن مشارکت می‌کنند، توسط آیین نامه رفتاری ما اداره می‌شوند. با مشارکت، از شما انتظار می‌رود این آیین نامه را رعایت کنید. لطفاً رفتار غیرقابل قبول را به نگهدارندگان پروژه گزارش دهید.

### چگونه می‌توانم مشارکت کنم؟

#### گزارش باگ‌ها

- بررسی کنید که آیا باگ قبلاً در بخش Issues گزارش شده است
- هنگام ایجاد مسئله جدید از قالب گزارش باگ استفاده کنید
- مراحل دقیق برای بازتولید مشکل را شامل کنید
- رفتار مورد انتظار و آنچه واقعاً رخ داده است را توصیف کنید
- در صورت امکان، تصاویر صفحه را شامل کنید

#### پیشنهاد بهبودها

- هنگام پیشنهاد بهبودها از قالب درخواست ویژگی استفاده کنید
- ویژگی و مزایای آن را به وضوح توصیف کنید
- مثال‌هایی از نحوه استفاده از ویژگی ارائه دهید
- در نظر داشته باشید که ماکت‌ها یا نمودارها را شامل کنید

#### مشارکت‌های کد

ما از مشارکت‌های کد برای موارد زیر استقبال می‌کنیم:

- رفع باگ‌ها
- ویژگی‌های جدید
- بهبود عملکرد
- بهبود مستندات
- بهبود مدل‌های هوش مصنوعی

### تنظیمات توسعه

1. Fork کردن مخزن
2. کلون کردن fork خود: `git clone https://github.com/yourusername/ai-project-manager.git`
3. نصب وابستگی‌ها: `pnpm install`
4. ایجاد فایل `.env` بر اساس `.env.example`
5. اجرای سرور توسعه: `pnpm dev`

### فرآیند درخواست ادغام

1. ایجاد یک شاخه جدید برای ویژگی یا رفع باگ خود: `git checkout -b feature/your-feature-name`
2. تغییرات خود را اعمال کنید و آنها را با پیام‌های واضح و توصیفی کامیت کنید
3. شاخه خود را به fork خود push کنید: `git push origin feature/your-feature-name`
4. یک درخواست ادغام (pull request) به شاخه `main` مخزن اصلی ایجاد کنید
5. اطمینان حاصل کنید که توضیحات PR شما به وضوح تغییرات را توصیف می‌کند و به مسائل مرتبط اشاره می‌کند
6. منتظر بررسی بمانید و بازخوردها را برطرف کنید

### راهنمای کدنویسی

#### راهنمای سبک JavaScript

- از تنظیمات پیکربندی شده ESLint و Prettier استفاده کنید
- قبل از ارسال PR خود، `pnpm format` را اجرا کنید
- از سبک کد موجود در پروژه پیروی کنید
- از نام‌های متغیر و توابع معنادار استفاده کنید
- برای توابع و بلوک‌های کد پیچیده، نظرات JSDoc را شامل کنید

#### تست

- برای ویژگی‌های جدید، تست بنویسید
- قبل از ارسال PR، اطمینان حاصل کنید که همه تست‌ها قبول می‌شوند
- برای اجرای مجموعه تست، `pnpm test` را اجرا کنید

#### پیام‌های کامیت

- از پیام‌های کامیت واضح و توصیفی استفاده کنید
- با یک فعل در زمان حال شروع کنید (Add، Fix، Update و غیره)
- در صورت امکان، به شماره‌های مسئله اشاره کنید
- کامیت‌ها را روی یک تغییر خاص متمرکز نگه دارید

مثال:
```
Fix: Prevent task duration prediction from crashing when TensorFlow is unavailable (#123)
```

### مشارکت در ویژگی‌های هوش مصنوعی

هنگام مشارکت در ویژگی‌های مرتبط با هوش مصنوعی:

#### یکپارچه‌سازی TensorFlow

- همیشه برای ویژگی‌های TensorFlow، فالبک‌های کارآمد قرار دهید
- با هر دو سناریوی در دسترس بودن و نبودن TensorFlow تست کنید
- معماری مدل و رویکرد آموزش را مستند کنید
- اندازه مدل و پیامدهای عملکرد را در نظر بگیرید

#### فالبک‌های ابتکاری

- هنگام اضافه کردن ویژگی‌های جدید ML، جایگزین‌های مبتنی بر قاعده را پیاده‌سازی کنید
- از رابط‌های API یکسان بین روش‌های ML و ابتکاری اطمینان حاصل کنید
- فیلد `method` را در تمام پاسخ‌های مرتبط با هوش مصنوعی قرار دهید
- رویکرد ابتکاری استفاده شده را مستند کنید

#### عملکرد مدل

- در صورت امکان، معیارهای عملکرد مدل را شامل کنید
- هم دقت و هم کارایی محاسباتی را در نظر بگیرید
- در سناریوهای مختلف داده تست کنید

### مستندات

- README.md را با جزئیات تغییرات قابل توجه به‌روز کنید
- ویژگی‌های جدید، به ویژه قابلیت‌های هوش مصنوعی را مستند کنید
- مستندات API و تعاریف Swagger را به‌روز کنید
- برای قابلیت‌های جدید مثال‌هایی اضافه کنید

---

با تشکر از مشارکت شما در مدیریت پروژه هوشمند! تلاش‌های شما به بهبود این پروژه برای همه کمک می‌کند. 