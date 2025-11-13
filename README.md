# Novaera ERP Web

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

A modern, full-featured Enterprise Resource Planning (ERP) system built with Next.js 15, React 19, and a comprehensive role-based access control system. This application provides a complete solution for managing users, modules, roles, permissions, and dynamic data tables with an intuitive and professional user interface.

## Table of Contents

- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [License](#license)
- [Contributing](#contributing)

## Introduction

Novaera ERP Web is a comprehensive ERP frontend application designed to streamline business operations through efficient user management, modular architecture, and flexible data management. The system features:

- **User Management**: Complete CRUD operations for user accounts with role assignment
- **Module Management**: Dynamic module creation and configuration
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **Dynamic Tables**: Create and manage logical tables with custom columns and relationships
- **Real-time Notifications**: System-wide notification management
- **Secure Authentication**: JWT-based authentication with HTTP-only cookies
- **Responsive Design**: Modern UI with drag-and-drop functionality

## Technologies Used

### Core Framework
- **Next.js 15.3.3** - React framework with App Router
- **React 19.0.0** - UI library
- **React DOM 19.0.0** - React rendering

### UI & Interaction
- **React Icons 5.5.0** - Icon library
- **@dnd-kit/core 6.3.1** - Drag and drop functionality
- **@dnd-kit/sortable 10.0.0** - Sortable lists
- **@dnd-kit/modifiers 9.0.0** - Drag and drop modifiers
- **date-fns 4.1.0** - Date formatting and manipulation

### HTTP & Data
- **Axios 1.9.0** - HTTP client for API requests
- **js-cookie 3.0.5** - Cookie management

### Authentication & Security
- **jose** - JWT verification and validation
- **Next.js Middleware** - Route protection

### Development Tools
- **JavaScript (JSX)** - Primary programming language
- **CSS Modules** - Component-scoped styling

## Features

### User Management
- Create, read, update, and delete users
- Role assignment and management
- User status tracking (active/inactive)
- Search and filter functionality
- Pagination support

### Module Management
- Dynamic module creation
- Module configuration and customization
- Module-based navigation
- Icon and description management

### Role & Permissions
- Role creation and management
- Granular permission assignment
- Permission matrix visualization
- Role-based UI rendering

### Dynamic Tables
- Create logical tables with custom columns
- Support for various data types
- Foreign key relationships
- Dynamic form generation
- Table filtering and pagination

### Notifications
- Real-time notification system
- Notification polling
- Status tracking
- User-specific notifications

### Authentication & Security
- JWT-based authentication
- HTTP-only cookie storage
- Protected routes via middleware
- Role-based access control
- Secure API communication

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Backend API server (see deployment section)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/novaera-erp-web.git
   cd novaera-erp-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your environment variables (see [Environment Variables](#environment-variables))

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
novaera-erp-web/
├── public/                 # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── vercel.svg
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── dashboard/     # Dashboard page
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   ├── usuarios/      # User management
│   │   ├── modulos/       # Module management
│   │   ├── roles/         # Role management
│   │   ├── permissions/   # Permissions management
│   │   ├── tablas-logicas/# Dynamic tables
│   │   └── notificaciones/# Notifications
│   ├── components/        # React components
│   │   ├── commmon/       # Common UI components
│   │   ├── layout/        # Layout components
│   │   ├── modules/       # Module components
│   │   ├── users/         # User components
│   │   ├── roles/         # Role components
│   │   ├── tables/        # Table components
│   │   └── ui/            # UI components
│   ├── context/           # React Context providers
│   │   └── AuthContext.js # Authentication context
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useUsers.js
│   │   ├── useModules.js
│   │   └── ...
│   ├── lib/               # Utility libraries
│   │   ├── axios.js       # Axios configuration
│   │   └── cookies.js     # Cookie utilities
│   ├── services/          # API services
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── moduleService.js
│   │   └── ...
│   └── utils/             # Utility functions
│       └── debugUtils.js
├── middleware.js          # Next.js middleware for route protection
├── next.config.mjs        # Next.js configuration
├── jsconfig.json          # JavaScript configuration
├── package.json           # Project dependencies
└── README.md              # This file
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# JWT Secret for token verification
JWT_SECRET=your-secret-key-here

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Important**: Never commit your `.env` file to version control. Use `.env.example` as a template.

## Deployment

### Vercel (Recommended)

[Vercel](https://vercel.com) provides seamless deployment for Next.js applications:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Deployment Options

- **Netlify**: Similar to Vercel, supports Next.js out of the box
- **AWS Amplify**: For AWS infrastructure integration
- **Railway**: Simple deployment with environment variable management
- **Render**: Full-stack deployment platform
- **Docker**: Containerize the application for any platform

### Production Checklist

- [ ] Set strong `JWT_SECRET` in production environment
- [ ] Configure `NEXT_PUBLIC_API_URL` to point to production API
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS on backend API
- [ ] Set up monitoring and error tracking
- [ ] Configure environment-specific builds
- [ ] Test authentication flow in production
- [ ] Verify all protected routes are working

## License

Copyright (c) 2024 Steven Morales Fallas

All rights reserved. Redistribution, modification, reproduction, sublicensing, or any form of transaction (including commercial, educational, or promotional use) involving this repository, its source code, or derived works is strictly prohibited without the explicit and personal written authorization of the Lead Developer, Steven Morales Fallas.

Unauthorized commercial use, resale, or licensing of this repository or its contents is strictly forbidden and will be subject to applicable legal action.

## Contributing

This is a proprietary project. Contributions are not accepted at this time. For inquiries or collaboration requests, please contact Steven Morales Fallas directly.

---

**Developed by Steven Morales Fallas**

For questions, support, or licensing inquiries, please contact the repository owner.

