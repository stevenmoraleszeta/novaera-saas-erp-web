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
POST   /api/users                    // Create new user (expects: name, email, password_hash)
PUT    /api/users/:id                // Update user (expects: name, email, password_hash?, is_active?)
PUT    /api/users/:id/password       // Update user password
DELETE /api/users/:id                // Delete user
PUT    /api/users/:id/block          // Block user
PUT    /api/users/:id/unblock        // Unblock user
PUT    /api/users/:id/active         // Set user active status
PUT    /api/users/:id/reset-password // Reset password (admin only)
GET    /api/users/exists/email       // Check if email exists
PUT    /api/users/:id/avatar         // Set user avatar

// Roles Management (CRITICAL for user creation)
GET    /api/roles                    // Get all roles (returns: [{rol_id, rol_name}, ...])
POST   /api/roles                    // Create new role
GET    /api/roles/:id                // Get role by ID
POST   /api/roles/:id/assign         // Assign role to user (expects: {user_id})
DELETE /api/roles/:id/remove         // Remove role from user
GET    /api/roles/user/:user_id      // Get roles for specific user
POST   /api/roles/:id/permissions    // Set role permissions
PUT    /api/roles/:id/permissions    // Update role permissions
GET    /api/roles/:id/permissions/:table_id // Get role permissions
DELETE /api/roles/:id/permissions/:table_id // Delete role permissions

// Other Protected Modules
GET/POST/PUT/DELETE /api/modules     // Modules management
GET/POST/PUT/DELETE /api/tables      // Tables management
GET/POST/PUT/DELETE /api/columns     // Columns management
GET/POST/PUT/DELETE /api/records     // Records management
GET/POST/PUT/DELETE /api/permissions // Permissions management
GET/POST/PUT/DELETE /api/notifications // Notifications management
```

### Backend Data Format Specifications (IMPORTANT!)
```javascript
// Users Creation - Backend expects:
{
  name: string,
  email: string,
  password_hash: string,  // NOT "password"!
  role?: string          // Optional, for frontend logic
}

// Roles Response - Backend returns:
[
  {
    rol_id: number,       // NOT "id"!
    rol_name: string      // NOT "name"!
  }
]

// User Creation Process (2-step process):
// 1. POST /api/users (creates user in 'users' table)
// 2. POST /api/roles/:role_id/assign (creates relation in 'user_roles' table)
```

## Development Best Practices
- **Performance**: Use React.memo for expensive renders, useCallback for function props
- **State Management**: Prefer custom hooks over global state for module-specific logic
- **Code Splitting**: Use dynamic imports for large components/modules
- **Accessibility**: Test with screen readers, ensure keyboard navigation
- **Mobile First**: Design for mobile devices first, then scale up
- **Error Handling**: Always provide user feedback for errors and loading states
- **Security**: Validate all inputs, sanitize data, use HTTPS in production

## Critical Backend Integration Lessons (MUST READ!)

### 🚨 Data Mapping Issues to Avoid:
```javascript
// ❌ WRONG - Frontend sending "password" but backend expects "password_hash"
const userData = { name, email, password, role };

// ✅ CORRECT - Map frontend data to backend format
const backendData = {
  name: userData.name,
  email: userData.email,
  password_hash: userData.password,  // Key mapping!
  role: userData.role
};
```

### 🚨 Database Relations - user_roles table:
- Users and roles have many-to-many relationship via `user_roles` table
- Creating a user is a 2-step process:
  1. Create user in `users` table
  2. Create relationship in `user_roles` table via `/api/roles/:id/assign`
- **Never skip step 2** or user will have no roles!

### 🚨 Optimistic Updates Problem:
```javascript
// ❌ WRONG - Shows fake data when backend fails
setUsers(prev => [fakeNewUser, ...prev]); // User appears but doesn't exist in DB

// ✅ CORRECT - Reload from server after successful operation
await createUser(userData);
await loadUsers(); // Refresh real data from server
```

### 🚨 Backend Response Format Inconsistencies:
```javascript
// Different endpoints may return different formats:
// Some return: { user: {...} }
// Some return: { message: "...", user: {...} }
// Some return: { id: 123 }
// Always check response structure and handle multiple formats
```

### 🛠️ Debugging Best Practices:
- **Always log backend requests/responses** for debugging
- **Use console.log extensively** during development
- **Check Network tab** in browser DevTools for actual API calls
- **Verify database state** after operations, don't trust frontend state

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

## 🤖 INSTRUCCIONES PARA AI ASSISTANT

### ⚠️ **LEER ANTES DE TRABAJAR EN ESTE PROYECTO:**

#### 1. **Backend No Estándar - Verificar SIEMPRE:**
```javascript
// Este proyecto tiene peculiaridades del backend:
// - password_hash en lugar de password
// - rol_id/rol_name en lugar de id/name para roles
// - Relaciones many-to-many requieren pasos adicionales
// - Stored procedures (ej: sp_registrar_usuario)

// ANTES de asumir cualquier formato, PREGUNTA o VERIFICA
```

#### 2. **Proceso de Usuario = 2 Pasos OBLIGATORIOS:**
```javascript
// NUNCA olvides que crear usuario requiere:
// 1. POST /api/users (crear en tabla users)
// 2. POST /api/roles/:id/assign (crear relación en user_roles)
// Si omites el paso 2, el usuario no tendrá roles!
```

#### 3. **NO Hagas Optimistic Updates:**
```javascript
// ❌ NUNCA hagas esto:
setUsers(prev => [...prev, fakeNewUser]);

// ✅ SIEMPRE haz esto:
await apiCall();
await refreshFromServer(); // Obtener datos reales
```

#### 4. **Logging Extensivo Durante Desarrollo:**
```javascript
// SIEMPRE agrega logs para debugging:
console.log('Sending to backend:', data);
console.log('Backend response:', response);
console.log('Mapped data:', mappedData);
```

#### 5. **Información Crucial que Debes Pedir:**
- **Formato exacto** de request/response de cada endpoint
- **Nombres exactos** de campos en base de datos
- **Relaciones entre tablas** y cómo manejarlas
- **Stored procedures** utilizados
- **Pasos adicionales** requeridos para operaciones complejas

#### 6. **Patrón de Desarrollo Recomendado:**
1. **Preguntar** por estructura exacta de datos
2. **Testear endpoint** manualmente (Postman/consola)
3. **Documentar** formato real de respuesta
4. **Mapear datos** frontend ↔ backend
5. **Implementar** con logging extensivo
6. **Verificar** en base de datos

### 🚨 **Red Flags - Detener y Preguntar Si:**
- Usuario dice "no funciona" o "no se guarda"
- Datos aparecen en frontend pero no en BD
- Campos tienen nombres como "password" vs "password_hash"
- Hay relaciones many-to-many involucradas
- Respuesta del backend tiene formato inesperado

### 📋 **Template de Información Requerida:**
Cuando trabajes en nuevos módulos, pide ESPECÍFICAMENTE:

```
1. Endpoints exactos y métodos HTTP
2. Estructura de request body (nombres exactos de campos)
3. Estructura de response (formato completo)
4. Tablas de BD involucradas
5. Relaciones many-to-many existentes
6. Stored procedures utilizados
7. Pasos adicionales requeridos
8. Manejo de errores específicos del backend
```