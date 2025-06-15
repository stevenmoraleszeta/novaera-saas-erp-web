# Description
DON'T use emojis. This project involves developing a comprehensive ERP system frontend using Next.js, PostgreSQL db called ERPSystem, featuring multiple modules for user and role management, permissions, notifications, logical tables, and dynamic data handling. Key modules include: base configuration and authentication (JWT/cookies), user and role management with CRUD operations, permission assignment via interactive matrices, notification center with real-time updates, logical table and column management for dynamic data structures, and responsive report generation with dashboards and PDF export. The system ensures secure access through middleware, role-based permissions, and a global auth context, while maintaining a responsive and accessible UI with reusable components and hooks.

## Project Architecture
- **Framework**: Next.js 15.3.3 with App Router
- **Database**: PostgreSQL (ERPSystem)
- **Authentication**: JWT tokens stored in httpOnly cookies
- **Styling**: Styled JSX with CSS-in-JS approach
- **Icons**: Phosphor Icons (react-icons/pi)
- **HTTP Client**: Axios with interceptors for auth
- **State Management**: React hooks with custom hooks for complex state

## Current Implementation Status

### Completed Modules
1. **Authentication System**
   - JWT-based authentication with cookies
   - AuthContext for global state management
   - Middleware for route protection
   - Login/Register pages with form validation

2. **User Management Module (Submódulo 2.1)**
   - Complete CRUD operations for users
   - Advanced search with debounce (300ms)
   - Multi-column sorting and filtering
   - Pagination with dynamic page controls
   - Real-time status toggle (active/inactive)
   - User blocking/unblocking functionality
   - Password management (update/reset by admin)
   - Avatar upload and management
   - Email existence validation
   - Responsive design with mobile optimization
   - Custom hooks for state management (useUsers)

### Modules Architecture Patterns
- **Custom Hooks**: Encapsulate business logic and API calls
- **Service Layer**: Separate API calls from components
- **Compound Components**: Complex UI components with multiple parts
- **Responsive Design**: Mobile-first approach with CSS Grid/Flexbox
- **Error Handling**: Centralized error management with user feedback
- **Optimistic Updates**: Immediate UI updates with rollback on error 

# bash commands
- DON'T execute commands on agent mode. 
- In case of needing to execute a command, inform the user.

# Core files and utility functions
- On /src/app you can find the current applications
- On /src/components you can find the current components
- On /src/hooks you can find custom hooks for state management
- On /src/services you can find API service functions
- On /src/context you can find React contexts (AuthContext)
- On /src/lib you can find utility functions (axios config, cookies)

## File Structure & Organization
```
src/
├── app/                          # Next.js App Router pages
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── usuarios/                 # User management page
│   └── layout.js                 # Root layout with providers
├── components/                   # Reusable UI components
│   ├── Alert.jsx                 # Notification alerts
│   ├── Button.jsx                # Styled button component
│   ├── FormInput.jsx             # Form input with validation
│   ├── Loader.jsx                # Loading spinner
│   ├── MainContent.jsx           # Main content wrapper
│   ├── Pagination.jsx            # Table pagination component
│   ├── SearchBar.jsx             # Search input with debounce
│   ├── Sidebar.jsx               # Navigation sidebar
│   ├── Topbar.jsx                # Top navigation bar
│   ├── UsersTable.jsx            # Users data table
│   └── UserStatusBadge.jsx       # User status indicator
├── context/                      # React contexts
│   └── AuthContext.js            # Authentication state management
├── hooks/                        # Custom React hooks
│   └── useUsers.js               # User management hook
├── lib/                          # Utility libraries
│   ├── axios.js                  # Axios configuration
│   └── cookies.js                # Cookie utilities
└── services/                     # API service functions
    ├── authService.js            # Authentication APIs
    └── userService.js            # User management APIs (CRUD, status, password, avatar)
```

## Component Patterns & Standards
- **Styled JSX**: All components use inline styles with JSX for encapsulation
- **Props Interface**: Clear prop definitions with defaults and destructuring
- **Responsive Design**: Mobile-first with CSS Grid/Flexbox and media queries
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Performance**: useCallback for expensive operations, conditional rendering
- **Error Boundaries**: Graceful error handling with user feedback

# Code style
- Write code in English
- Content of the page WILL BE SHOWN IN SPANISH. THIS IS IMPORTANT. CONTENT IN SPANISH ONLY.
- Use semantic HTML elements and ARIA attributes for accessibility
- Follow consistent naming conventions: camelCase for variables/functions, PascalCase for components
- Use descriptive variable names and add comments for complex logic
- Implement proper error handling with try-catch blocks
- Use TypeScript-style JSDoc comments for function documentation

## Design System & Theme
```css
/* Primary Colors */
--primary-green: #7ed957;           /* Main theme color */
--primary-hover: #6bb946;           /* Hover states */
--success-bg: #d4f2cb;              /* Success backgrounds */
--success-text: #2d5a27;           /* Success text */

/* Neutral Colors */
--text-primary: #111827;            /* Main text */
--text-secondary: #6b7280;          /* Secondary text */
--border-color: #e5e7eb;            /* Borders */
--background: #f9fafb;              /* Backgrounds */

/* Status Colors */
--error-bg: #fee2e2;                /* Error backgrounds */
--error-text: #dc2626;              /* Error text */
--warning-bg: #fef3c7;              /* Warning backgrounds */
--warning-text: #d97706;            /* Warning text */
--info-bg: #e0f2fe;                 /* Info backgrounds */
--info-text: #0369a1;               /* Info text */
```

## API Integration Standards
- Base URL: `process.env.NEXT_PUBLIC_API_URL` or `http://localhost:3001/api`
- Authentication: JWT tokens in httpOnly cookies with `withCredentials: true`
- Error handling: Consistent error response format with user-friendly messages
- Loading states: Always show loading indicators for async operations
- Optimistic updates: Update UI immediately, rollback on error

### API Endpoints Structure (Backend Routes)
```javascript
// Authentication (No middleware required)
POST /api/auth/login         // User login
POST /api/auth/register      // User registration
GET  /api/auth/me            // Get current user
POST /api/auth/logout        // User logout

// Protected Routes (Require authentication middleware)
// Users Management
GET    /api/users                    // Get users with pagination/filters
POST   /api/users                    // Create new user
PUT    /api/users/:id                // Update user
PUT    /api/users/:id/password       // Update user password
DELETE /api/users/:id                // Delete user
PUT    /api/users/:id/block          // Block user
PUT    /api/users/:id/unblock        // Unblock user
PUT    /api/users/:id/active         // Set user active status
PUT    /api/users/:id/reset-password // Reset password (admin only)
GET    /api/users/exists/email       // Check if email exists
PUT    /api/users/:id/avatar         // Set user avatar

// Other Protected Modules
GET/POST/PUT/DELETE /api/modules     // Modules management
GET/POST/PUT/DELETE /api/tables      // Tables management
GET/POST/PUT/DELETE /api/columns     // Columns management
GET/POST/PUT/DELETE /api/records     // Records management
GET/POST/PUT/DELETE /api/roles       // Roles management
GET/POST/PUT/DELETE /api/permissions // Permissions management
GET/POST/PUT/DELETE /api/notifications // Notifications management
```

## Development Best Practices
- **Performance**: Use React.memo for expensive renders, useCallback for function props
- **State Management**: Prefer custom hooks over global state for module-specific logic
- **Code Splitting**: Use dynamic imports for large components/modules
- **Accessibility**: Test with screen readers, ensure keyboard navigation
- **Mobile First**: Design for mobile devices first, then scale up
- **Error Handling**: Always provide user feedback for errors and loading states
- **Security**: Validate all inputs, sanitize data, use HTTPS in production

## Future Module Development Guidelines
When developing new modules, follow this structure:
1. **Service Layer**: Create API service functions in `/src/services/`
2. **Custom Hook**: Encapsulate business logic in `/src/hooks/`
3. **Components**: Build reusable UI components in `/src/components/`
4. **Page Integration**: Create the main page in `/src/app/[module]/`
5. **Documentation**: Update this CLAUDE.md file with new module info

## Key Patterns to Maintain
- **Search**: Always implement debounce (300ms) for search inputs
- **Tables**: Include sorting, filtering, pagination, and actions
- **Forms**: Use FormInput component with validation and error states
- **Modals**: Implement with proper focus management and escape key handling
- **Notifications**: Use Alert component for success/error feedback
- **Loading States**: Show spinners for async operations
- **Empty States**: Provide helpful empty state messages with actions

# Prompt answering
- You will respond to prompts in Spanish, even if the prompt is made in English
- Always maintain code quality and follow established patterns
- When suggesting new features, consider the existing architecture
- Prioritize user experience and accessibility in all implementations