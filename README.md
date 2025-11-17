# Novaera SaaS ERP - Web Application

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.10-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

> **Frontend application for a modern SaaS ERP system built with Next.js**

## ✨ Introduction

Novaera SaaS ERP Web is a comprehensive frontend application for an Enterprise Resource Planning (ERP) system. Built with Next.js 15 and React 19, it provides a modern, responsive interface for managing modules, tables, records, users, roles, permissions, notifications, and more.

The application features a dynamic, metadata-driven architecture that allows users to create custom modules, tables, and data structures on the fly, all through an intuitive web interface.

### Key Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with httpOnly cookies
- 📊 **Dynamic Data Modeling**: Create and manage custom modules, tables, and columns
- 📝 **Record Management**: Full CRUD operations with assigned users and comments
- 🔔 **Notifications**: Real-time notifications with polling and scheduled notifications
- 📁 **File Management**: Secure file upload and display
- 📋 **Views & Sorting**: Custom views with advanced sorting capabilities
- 👥 **User Management**: Complete user administration with roles and permissions
- 🎨 **Modern UI**: Built with Radix UI, Tailwind CSS, and Framer Motion
- 📱 **Responsive Design**: Mobile-first approach with full mobile support
- 🎯 **Drag & Drop**: Sortable modules and tabs using @dnd-kit

## 🚀 Technologies Used

- **Framework**: Next.js 15.3.3 (App Router)
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 4.1.10
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React, React Icons
- **State Management**: Zustand, React Hooks
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Drag & Drop**: @dnd-kit
- **Notifications**: Sonner (toast notifications)
- **Emoji Support**: emoji-picker-react, fluentui-emoji

## ⚙️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to the Novaera ERP API backend
- PostgreSQL database (configured via API)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/novaera-saas-erp-web.git
   cd novaera-saas-erp-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   
   # Development
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

The application will be available at `http://localhost:3000` (or the port specified in your configuration).

## 📋 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Development
NODE_ENV=development
```

## 🧩 Project Structure

```
novaera-saas-erp-web/
│
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (app)/                  # Protected app routes
│   │   │   ├── layout.jsx          # App layout with header/footer
│   │   │   ├── modules/            # Modules management page
│   │   │   ├── modulos/[id]/       # Module detail page
│   │   │   ├── usuarios/           # Users management page
│   │   │   ├── roles/              # Roles management page
│   │   │   ├── permissions/       # Permissions management page
│   │   │   ├── notifications/      # Notifications page
│   │   │   └── profile/            # User profile page
│   │   ├── login/                  # Login page
│   │   ├── register/               # Registration page
│   │   ├── layout.jsx              # Root layout
│   │   ├── page.jsx                # Home page
│   │   └── globals.css             # Global styles
│   │
│   ├── components/                 # React components
│   │   ├── auth/                   # Authentication components
│   │   │   └── AuthGuard.jsx       # Route protection component
│   │   ├── common/                 # Common reusable components
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FieldRenderer.jsx
│   │   │   └── ...
│   │   ├── columns/                # Column management components
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── modules/                # Module management components
│   │   ├── navbar/                 # Navigation components
│   │   ├── notifications/          # Notification components
│   │   ├── records/                # Record management components
│   │   ├── roles/                  # Role management components
│   │   ├── tables/                 # Table management components
│   │   ├── tabs/                   # Tab management components
│   │   ├── users/                  # User management components
│   │   └── ui/                     # UI primitives (Radix UI wrappers)
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuthRedirect.js
│   │   ├── useAuthValidation.js
│   │   ├── useAxiosAuth.js
│   │   ├── useColumns.js
│   │   ├── useModules.js
│   │   ├── useUsers.js
│   │   ├── useRoles.js
│   │   ├── useNotifications.js
│   │   └── ...
│   │
│   ├── services/                   # API service functions
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── moduleService.js
│   │   ├── tablesService.js
│   │   ├── recordsService.js
│   │   ├── permissionsService.js
│   │   └── ...
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── userStore.js
│   │   ├── editModeStore.js
│   │   └── tabStore.js
│   │
│   ├── lib/                        # Utility libraries
│   │   ├── axios.js                # Axios configuration
│   │   └── utils.js                # Utility functions
│   │
│   ├── utils/                      # Additional utilities
│   │   └── debugUtils.js
│   │
│   └── middleware.js               # Next.js middleware for auth
│
├── public/                         # Static assets
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── components.json                 # shadcn/ui configuration
├── jsconfig.json                   # JavaScript configuration
├── next.config.mjs                # Next.js configuration
├── package.json                    # Project dependencies
├── postcss.config.mjs              # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
└── README.md                       # This file
```

## 📚 Main Features

### Authentication
- JWT-based authentication with httpOnly cookies
- Protected routes with middleware
- Login and registration pages
- Session management
- Auto-redirect based on auth state
- **Admin Quick Login**: One-click admin login button on login pages
- **Auto Admin Creation**: Automatically creates admin user if it doesn't exist
- **Universal Admin Permissions**: All users have admin permissions by default

### Module Management
- Create, read, update, and delete modules
- Drag-and-drop module sorting
- Module icons and customization
- Module status management
- Filter and search modules

### Table Management
- Dynamic table creation within modules
- Table relationships (foreign keys)
- Table tabs with drag-and-drop sorting
- Table collaboration features

### Column Management
- Dynamic column creation
- Multiple column types (text, number, date, select, etc.)
- Foreign key relationships
- Custom options for select columns
- Column validation

### Record Management
- Full CRUD operations for records
- Dynamic forms based on column definitions
- Record assignment to users
- Record comments system
- File attachments
- Audit log viewing

### User Management
- Complete user administration
- User roles assignment
- User status management (active/inactive, blocked)
- Password management
- Avatar upload
- Advanced search and filtering

### Role Management
- Create and manage roles
- Assign roles to users
- Role permissions configuration
- Permission matrix interface

### Permissions Management
- Fine-grained CRUD permissions
- Role-based permissions
- Table-level permissions
- Permission matrix visualization
- **Note**: Currently, all users have admin-level permissions by default

### Notifications
- Real-time notification polling
- Scheduled notifications
- Notification center
- Mark as read/unread
- Notification subscriptions

### Views & Sorting
- Custom views for tables
- Advanced sorting capabilities
- View configuration
- Sort persistence

## 🎨 Design System

### Colors
- **Primary Green**: `#7ed957` - Main theme color
- **Primary Hover**: `#6bb946` - Hover states
- **Success**: `#d4f2cb` background, `#2d5a27` text
- **Error**: `#fee2e2` background, `#dc2626` text
- **Warning**: `#fef3c7` background, `#d97706` text
- **Info**: `#e0f2fe` background, `#0369a1` text

### Typography
- **Font**: Geist Sans (primary), Geist Mono (monospace)
- Optimized font loading with Next.js font optimization

## 🔒 Security Features

- JWT tokens stored in httpOnly cookies
- Protected API routes with authentication middleware
- CORS configuration
- Input validation and sanitization
- Secure file upload handling
- XSS prevention

## 👤 Default Admin User

The application includes a default administrator account for quick access:

- **Email**: `admin@novaeracorp.com`
- **Password**: `admin123`
- **Name**: Administrador

### Features

- **Quick Login Button**: Available on both `/` and `/login` pages
- **Auto-Creation**: If the admin user doesn't exist, it will be automatically created on first use
- **Smart Detection**: The system checks if the user exists before attempting creation
- **Extended Timeouts**: Login and registration operations use extended timeouts (60 seconds) for production environments

### Usage

Click the "Ingresar como Administrador" button on the login page to automatically log in with the default admin credentials. If the user doesn't exist in the database, it will be created automatically.

## 🚀 Deployment

### Recommended Platforms

- **Vercel**: Optimized for Next.js applications
- **Netlify**: Easy deployment with continuous integration
- **AWS Amplify**: Full-stack deployment solution
- **Railway**: Simple deployment with environment variables
- **Render**: Easy setup with automatic deployments

### Deployment Checklist

1. Set `NODE_ENV=production` in environment variables
2. Configure `NEXT_PUBLIC_API_URL` to production API URL
3. Ensure API backend is accessible from frontend domain
4. Configure CORS on API backend to allow frontend domain
5. Build the application: `npm run build`
6. Test the production build locally: `npm start`
7. Deploy to your chosen platform
8. Verify environment variables are set correctly

### Example: Deploying to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run dev:no-turbo` - Start development server without Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Clean `.next` directory (Windows)

### Development Best Practices

- Use custom hooks for business logic
- Follow the component structure patterns
- Implement proper error handling
- Use loading states for async operations
- Follow accessibility guidelines
- Test on multiple screen sizes
- Use semantic HTML elements

## 📝 Code Style

- **Language**: JavaScript (no TypeScript)
- **Content**: Spanish for user-facing content
- **Code**: English for code, variables, and comments
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Styling**: Tailwind CSS utility classes
- **Components**: Functional components with hooks

## 🔗 API Integration

The frontend communicates with the Novaera ERP API backend. Ensure the API is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

### API Configuration

- **Base Timeout**: 30 seconds for general API requests
- **Auth Timeout**: 60 seconds for login and registration operations (to handle cold starts in production)
- **Error Handling**: Improved timeout error messages for better user experience

### API Endpoints Used

- Authentication: `/api/auth/*`
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration
  - `GET /api/auth/me` - Get current user
  - `POST /api/auth/logout` - User logout
- Users: `/api/users/*`
  - `GET /api/users/exists/email` - Check if email exists
- Roles: `/api/roles/*`
- Modules: `/api/modules/*`
- Tables: `/api/tables/*`
- Columns: `/api/columns/*`
- Records: `/api/records/*`
- Permissions: `/api/permissions/*`
- Notifications: `/api/notifications/*`
- Files: `/api/files/*`
- Views: `/api/views/*`
- And more...

See `API_ROUTES.md` for complete API documentation.

## 📜 License

**Proprietary License**

Copyright (c) 2025 Steven Morales Fallas

All rights reserved. Redistribution, modification, reproduction, sublicensing, or any form of transaction (including commercial, educational, or promotional use) involving this repository, its source code, or derived works is strictly prohibited without the explicit and personal written authorization of the Lead Developer, Steven Morales Fallas.

Unauthorized commercial use, resale, or licensing of this repository or its contents is strictly forbidden and will be subject to applicable legal action.

For licensing inquiries, please contact: Steven Morales Fallas

## 👤 Author

**Steven Morales Fallas**

Full Stack Developer specializing in SaaS ERP systems, modern web applications, and scalable frontend solutions.

## 🤝 Contributing

This is a proprietary project. Contributions are by invitation only. Please contact the author for collaboration opportunities.

## 📞 Support

For questions, issues, or licensing inquiries, please contact the repository owner.

---

**Note**: This frontend application is part of a larger SaaS ERP system. Ensure proper integration with the corresponding API backend (`novaera-saas-erp-api`) and database (`novaera-saas-erp-db`).
