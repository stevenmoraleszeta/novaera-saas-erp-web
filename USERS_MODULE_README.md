#  Módulo de Gestión de Usuarios - ERP System

##  Descripción General

El Módulo de Gestión de Usuarios es un componente integral del sistema ERP que permite administrar usuarios de manera eficiente y segura. Implementa funcionalidades completas de CRUD (Crear, Leer, Actualizar, Eliminar) con características avanzadas de búsqueda, filtrado, paginación y ordenamiento.

##  Características Principales

### Funcionalidades Implementadas

- Vista principal de usuarios con tabla dinámica
- Búsqueda en tiempo real con debounce
- Filtros avanzados por rol y estado
- Paginación inteligente con navegación completa
- Ordenamiento bidireccional por múltiples columnas
- Acciones en tiempo real (activar/desactivar, bloquear/desbloquear, editar, eliminar)
- Gestión avanzada de contraseñas (cambio de contraseña, reset por admin)
- Gestión de avatares (subida y actualización de imágenes)
- Validación de emails (verificación de existencia en tiempo real)
- Diseño responsivo y accesible
- Autenticación JWT con gestión de estados
- Manejo de errores y notificaciones de éxito

### Estados de Usuario Visuales

- Usuario Activo: Badge verde con indicador visual
- Usuario Inactivo: Badge gris con indicador visual
- Usuario Bloqueado: Badge rojo con indicador visual
- Avatar generado: Iniciales con colores del tema o imagen personalizada

## Arquitectura del Módulo

### Estructura de Archivos

```
src/
├── app/usuarios/
│   └── page.js                    # Página principal de gestión
├── components/
│   ├── UsersTable.jsx             # Tabla de usuarios
│   ├── UserStatusBadge.jsx        # Badge de estado
│   ├── SearchBar.jsx              # Barra de búsqueda
│   └── Pagination.jsx             # Componente de paginación
├── hooks/
│   └── useUsers.js                # Hook personalizado
└── services/
    └── userService.js             # Servicios de API
```

### 🔧 Componentes Principales

#### 1. **UsuariosPage** (`/usuarios`)
Página principal que integra todos los componentes:
- Manejo de autenticación
- Gestión de estado centralizada
- Integración con el hook personalizado
- Layout responsivo con header y acciones

#### 2. **UsersTable**
Tabla avanzada con funcionalidades completas:
- Selección múltiple con checkboxes
- Ordenamiento por columnas clickeables
- Acciones por fila (ver, editar, toggle, eliminar)
- Estados de carga y vacío
- Diseño responsivo para móviles

#### 3. **SearchBar**
Búsqueda inteligente con:
- Debounce de 300ms para optimización
- Placeholder dinámico
- Botón de limpiar búsqueda
- Estilos focus con tema verde

#### 4. **UserStatusBadge**
Indicador visual de estado:
- Tres tamaños disponibles (small, medium, large)
- Colores dinámicos según estado
- Efecto hover con elevación
- Indicador circular animado

#### 5. **Pagination**
Paginación completa con:
- Navegación a primera/última página
- Páginas visibles dinámicas
- Información de elementos mostrados
- Controles de navegación con iconos

### **useUsers Hook**
Hook personalizado que encapsula:
- **Estado centralizado** de usuarios
- **Operaciones CRUD** optimizadas
- **Paginación y filtros** integrados
- **Manejo de errores** consistente
- **Callbacks optimizados** con useCallback

## Tecnologías Utilizadas

### Dependencias Principales
- **Next.js 15.3.3** - Framework React
- **React 19.0.0** - Biblioteca UI
- **Axios** - Cliente HTTP
- **js-cookie** - Manejo de cookies
- **react-icons/pi** - Iconografía Phosphor

### Patrones de Diseño
- **Styled JSX** para estilos encapsulados
- **Custom Hooks** para lógica reutilizable
- **Compound Components** para componentes complejos
- **State Management** con hooks nativos
- **Error Boundaries** implícitos

## Integración con Backend

### Endpoints Utilizados (Backend Routes)

```javascript
// Obtener usuarios
GET /api/users

// Crear nuevo usuario (IMPORTANTE: requiere password_hash, no password)
POST /api/users
// Body: { name: string, email: string, password_hash: string }

// Actualizar usuario
PUT /api/users/:id
// Body: { name: string, email: string, password_hash?: string, is_active?: boolean }

// Actualizar contraseña de usuario
PUT /api/users/:id/password

// Eliminar usuario
DELETE /api/users/:id

// Bloquear usuario
PUT /api/users/:id/block

// Desbloquear usuario
PUT /api/users/:id/unblock

// Establecer estado activo/inactivo
PUT /api/users/:id/active

// Resetear contraseña (admin)
PUT /api/users/:id/reset-password

// Verificar si email existe
GET /api/users/exists/email?email=user@example.com

// Actualizar avatar de usuario
PUT /api/users/:id/avatar

// === ROLES ENDPOINTS (CRÍTICOS para gestión de usuarios) ===
// Obtener todos los roles
GET /api/roles
// Response: [{ rol_id: number, rol_name: string }, ...]

// Asignar rol a usuario (OBLIGATORIO después de crear usuario)
POST /api/roles/:role_id/assign
// Body: { user_id: number }

// Obtener roles de un usuario
GET /api/roles/user/:user_id

// Remover rol de usuario
DELETE /api/roles/:role_id/remove
// Body: { user_id: number }
```

### Autenticación
- **JWT Tokens** almacenados en cookies httpOnly
- **Interceptores Axios** para autenticación automática
- **Manejo de sesiones** expiradas
- **Protección de rutas** con middleware

### 🔥 PROBLEMAS CRÍTICOS RESUELTOS

#### 1. **Mapeo de Datos Backend-Frontend**
```javascript
// ❌ PROBLEMA: Backend espera password_hash, frontend enviaba password
// ❌ PROBLEMA: Roles vienen como {rol_id, rol_name} no {id, name}

// ✅ SOLUCIÓN: Mapeo correcto en userService.js
const backendData = {
  name: userData.name,
  email: userData.email,
  password_hash: userData.password,  // Mapeo correcto
  role: userData.role
};

// ✅ SOLUCIÓN: Transformación de roles en fetchRoles()
return roles.map(role => ({
  id: role.rol_id || role.id,
  name: role.rol_name || role.name,
  label: getRoleDisplayName(role.rol_name || role.name)
}));
```

#### 2. **Tabla user_roles - Relación Many-to-Many**
```javascript
// ❌ PROBLEMA: Usuario se creaba pero no tenía roles asignados
// ✅ SOLUCIÓN: Proceso de 2 pasos obligatorio

// Paso 1: Crear usuario
const response = await axios.post('/users', backendData);

// Paso 2: Asignar rol (CRÍTICO - no omitir!)
if (userId && userData.role) {
  await assignRoleToUser(userId, userData.role);
}
```

#### 3. **Optimistic Updates Problemáticos**
```javascript
// ❌ PROBLEMA: Frontend mostraba usuarios "fantasma" cuando fallaba la creación
setUsers(prev => [fakeUser, ...prev]); // Usuario aparece pero no existe en BD

// ✅ SOLUCIÓN: Recargar datos reales del servidor
await createUser(userData);
await loadUsers(); // Obtener estado real de la BD
```

#### 4. **Validación de Email Inconsistente**
```javascript
// ❌ PROBLEMA: Email siempre aparecía como "ya registrado"
// ✅ SOLUCIÓN: Manejo robusto de diferentes formatos de respuesta

export async function checkEmailExists(email) {
  const data = response.data;
  
  // Manejar múltiples formatos de respuesta
  if (typeof data.exists === 'boolean') return data.exists;
  if (typeof data === 'boolean') return data;
  return !!data;
}
```

#### 5. **Extracción de ID de Usuario desde Mensajes de Texto** 🆕
```javascript
// ❌ PROBLEMA: Backend devuelve ID dentro de mensaje, no en campos estructurados
// Respuesta: { message: "Usuario registrado exitosamente con ID: 7" }
// Código esperaba: response.data.id, response.data.user.id, etc.

// ✅ SOLUCIÓN: Extracción por RegEx + múltiples estrategias
if (response.data.message) {
  const messageMatch = response.data.message.match(/ID:\s*(\d+)/i);
  if (messageMatch) {
    userId = parseInt(messageMatch[1]);
    console.log('📋 User ID extracted from message:', userId);
  }
}

// ✅ ESTRATEGIA COMPLETA: Múltiples fuentes de ID
let userId = null;
if (response.data) {
  // Intentar campos estructurados primero
  if (response.data.user?.id) userId = response.data.user.id;
  else if (response.data.id) userId = response.data.id;
  else if (response.data.insertId) userId = response.data.insertId;
  else if (response.data.user_id) userId = response.data.user_id;
  // Fallback: extraer de mensaje de texto
  else if (response.data.message) {
    const match = response.data.message.match(/ID:\s*(\d+)/i);
    if (match) userId = parseInt(match[1]);
  }
}
```

#### 6. **Warning de React Props en Componentes** 🆕
```javascript
// ❌ PROBLEMA: "Received `false` for a non-boolean attribute `loading`"
// Causa: Componente Button recibía props que no manejaba correctamente

// ✅ SOLUCIÓN: Filtrar props no-DOM del componente
export default function Button({ 
  variant, 
  type = 'button',
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children, 
  className = '', 
  ...props 
}) {
  // Filtrar props que no deben ir al DOM
  const { loading: _, ...domProps } = props;
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      {...domProps}  // Solo props válidas para DOM
    >
      {/* Contenido del botón */}
    </button>
  );
}
```

## Uso y Ejemplos

### Uso Básico del Hook

```javascript
import { useUsers } from '../hooks/useUsers';

function MyComponent() {
  const {
    users,
    loading,
    error,
    handleSearch,
    handleSort,
    handleToggleUserStatus,
    handleBlockUser,
    handleUnblockUser,
    handleUpdatePassword,
    handleResetPassword,
    handleUpdateAvatar,
    handleCheckEmailExists
  } = useUsers();

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <UsersTable 
        users={users} 
        loading={loading}
        onToggleStatus={handleToggleUserStatus}
        onBlock={handleBlockUser}
        onUnblock={handleUnblockUser}
      />
    </div>
  );
}
```

### Gestión Avanzada de Usuarios

```javascript
// Verificar si un email ya existe
const emailExists = await handleCheckEmailExists('user@example.com');

// Cambiar contraseña de un usuario
await handleUpdatePassword(userId, {
  currentPassword: 'oldpass',
  newPassword: 'newpass'
});

// Resetear contraseña (solo admin)
await handleResetPassword(userId, 'temporaryPassword123');

// Actualizar avatar
await handleUpdateAvatar(userId, {
  avatar: base64ImageData
});

// Bloquear/Desbloquear usuario
await handleBlockUser(user);
await handleUnblockUser(user);
```

### Filtros Personalizados

```javascript
const {
  filters,
  handleFilterChange
} = useUsers({ role: 'admin' }); // Filtro inicial

// Cambiar filtros
handleFilterChange({ 
  role: 'manager', 
  isActive: 'true' 
});
```

### Paginación Avanzada

```javascript
const {
  currentPage,
  totalPages,
  totalUsers,
  handlePageChange
} = useUsers();

return (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalItems={totalUsers}
    onPageChange={handlePageChange}
    maxVisiblePages={7}
  />
);
```

## Personalización y Estilos

### Variables de Tema

```css
:root {
  --primary-color: #7ed957;      /* Verde principal */
  --primary-hover: #6bb946;      /* Verde hover */
  --success-bg: #d4f2cb;         /* Fondo éxito */
  --error-bg: #fee2e2;           /* Fondo error */
  --border-color: #e5e7eb;       /* Bordes */
  --text-primary: #111827;       /* Texto principal */
  --text-secondary: #6b7280;     /* Texto secundario */
}
```

### 📱 Breakpoints Responsivos

```css
/* Tablet */
@media (max-width: 768px) {
  /* Diseño adaptativo para tablets */
}

/* Móvil */
@media (max-width: 480px) {
  /* Diseño optimizado para móviles */
}
```

## Configuración Avanzada

### Parámetros del Hook useUsers

```javascript
const {
  users,
  loading,
  error,
  success,
  // ... más propiedades
} = useUsers({
  role: 'admin',           // Filtro inicial por rol
  isActive: 'true',        // Filtro inicial por estado
  itemsPerPage: 15,        // Elementos por página
  initialSort: {           // Ordenamiento inicial
    key: 'name',
    direction: 'asc'
  }
});
```

### Configuración de Búsqueda

```javascript
<SearchBar
  onSearch={handleSearch}
  placeholder="Buscar usuarios..."
  debounceDelay={500}        // Delay personalizado
  className="custom-search"   // Clases adicionales
/>
```

## Rendimiento y Optimizaciones

### Características de Rendimiento

- **Debounce** en búsqueda (300ms)
- **Memoización** con useCallback
- **Lazy loading** de componentes
- **Paginación** para grandes datasets
- **Cache local** de resultados
- **Optimistic updates** para acciones rápidas

### Gestión de Estado

- **Estados locales** optimizados
- **Actualizaciones inmediatas** en UI
- **Rollback automático** en errores
- **Sincronización** con servidor

## Manejo de Errores

### 🛡️ Tipos de Error Manejados

- **Errores de conexión**
- **Errores de autenticación**
- **Errores de validación**
- **Errores de permisos**
- **Timeouts de requests**

### Sistema de Notificaciones

```javascript
// Error automático
setError('Error al cargar usuarios');

// Éxito automático
setSuccess('Usuario creado correctamente');

// Limpiar mensajes
clearMessages();
```

## Testing y Calidad

### Áreas de Testing Recomendadas

- **Búsqueda y filtros**
- **Paginación**
- **Operaciones CRUD**
- **Responsividad**
- **Accesibilidad**
- **Rendimiento**

## 📚 LECCIONES APRENDIDAS PARA FUTUROS DESARROLLOS

### 🔍 **Información Crítica que Necesitas ANTES de Desarrollar:**

#### 1. **Estructura Exacta de la Base de Datos**
```sql
-- Siempre especifica:
-- - Nombres exactos de campos (ej: password_hash vs password)
-- - Relaciones many-to-many (ej: user_roles)
-- - Tipos de datos y constraints
-- - Stored procedures utilizados (ej: sp_registrar_usuario)
```

#### 2. **Formato Exacto de Respuestas del Backend** 🚨 **CRÍTICO**
```javascript
// ⚠️ NUNCA ASUMAS el formato de respuesta - siempre verifica:

// Ejemplo real encontrado:
// POST /api/users devuelve: { message: "Usuario registrado exitosamente con ID: 7" }
// NO devuelve: { id: 7, user: {...} } como esperábamos

// Documenta EXACTAMENTE cómo responde cada endpoint:
// POST /api/users → { message: string } (ID dentro del mensaje!)
// GET /api/roles → [{ rol_id: number, rol_name: string }] (no id/name!)
// GET /api/users/exists/email → { exists: boolean } | boolean | any (inconsistente!)

// ✅ SIEMPRE incluye múltiples estrategias de extracción:
let id = null;
if (response.data.id) id = response.data.id;
else if (response.data.user?.id) id = response.data.user.id;
else if (response.data.message) {
  const match = response.data.message.match(/ID:\s*(\d+)/i);
  if (match) id = parseInt(match[1]);
}
```

#### 3. **Dependencias Entre Operaciones**
```javascript
// Especifica procesos multi-paso:
// Crear Usuario = Paso 1: POST /users + Paso 2: POST /roles/:id/assign
// Actualizar Usuario = ¿Se actualizan roles automáticamente o manualmente?
// Eliminar Usuario = ¿Cascade delete en user_roles o manual?
```

#### 4. **Estrategias de Debugging Obligatorias** 🆕
```javascript
// ✅ SIEMPRE implementa logging extensivo durante desarrollo:
console.log('🚀 Request data:', requestData);
console.log('📡 Backend response:', response);  
console.log('🔍 Extracted ID:', extractedId);
console.log('💾 Database verification needed');

// ✅ NUNCA confíes solo en el frontend - verifica en BD:
// - Ejecuta SELECT después de INSERT/UPDATE
// - Confirma que relaciones many-to-many se crearon
// - Verifica que los datos son exactamente los esperados
```

### 🛠️ **Recomendaciones para Nuevos Módulos:**

#### ✅ **HACER:**
- **Testear endpoints** con Postman/Insomnia ANTES de desarrollar frontend
- **Documentar formato** exacto de requests/responses (¡incluye casos raros!)
- **Usar logging extensivo** durante desarrollo (console.log es tu amigo)
- **Validar en base de datos** después de cada operación
- **Manejar múltiples formatos** de respuesta del backend
- **Separar claramente** mapeo de datos frontend-backend
- **Implementar múltiples estrategias** de extracción de datos (campos + regex + fallbacks)
- **Filtrar props no-DOM** en componentes React para evitar warnings
- **Verificar tipos de props** y manejar valores falsy correctamente

#### ❌ **NO HACER:**
- **Optimistic updates** sin validación de respuesta exitosa
- **Asumir formatos** de datos sin verificar (¡NUNCA!)
- **Hardcodear valores** que pueden cambiar (nombres de campos, IDs)
- **Mezclar lógica** de presentación con lógica de backend
- **Ignorar relaciones** de base de datos many-to-many
- **Confiar en un solo método** de extracción de datos (siempre tener fallbacks)
- **Pasar props no válidas** a elementos DOM (causa warnings de React)

### 🔧 **Template para Documentar Nuevos Endpoints:**
```javascript
// Endpoint: POST /api/[module]
// Purpose: [Descripción clara]
// Auth Required: [Sí/No]
// Request Body: { field1: type, field2: type }
// Response Success: { format_exacto }
// Response Error: { error: string }
// Side Effects: [Ej: Crea relación en tabla X]
// Database Changes: [Qué tablas se modifican]
// ID Extraction: [Cómo extraer ID si es necesario]
// Additional Steps: [Pasos adicionales requeridos]
```

### 📝 **Caso de Estudio: Creación de Usuarios** 🆕

**Problema Encontrado:**
Usuario se creaba correctamente en base de datos, pero el frontend no podía asignar el rol porque no extraía el ID correctamente.

**Síntomas:**
- Console mostraba: `Extracted userId: null`
- Luego: `Could not assign role: userId = null, role = admin`
- Usuario aparecía en BD con rol por defecto en lugar del seleccionado

**Causa Raíz:**
Backend devolvía respuesta en formato:
```javascript
{ message: "Usuario registrado exitosamente con ID: 7" }
```
Pero el código esperaba:
```javascript
{ id: 7 } // o { user: { id: 7 } }
```

**Solución Implementada:**
```javascript
// Múltiples estrategias de extracción
let userId = null;
if (response.data.user?.id) {
    userId = response.data.user.id;
} else if (response.data.id) {
    userId = response.data.id;
} else if (response.data.insertId) {
    userId = response.data.insertId;
} else if (response.data.user_id) {
    userId = response.data.user_id;
} else if (response.data.message) {
    // Extracción por RegEx del mensaje
    const messageMatch = response.data.message.match(/ID:\s*(\d+)/i);
    if (messageMatch) {
        userId = parseInt(messageMatch[1]);
    }
}
```

**Lecciones Clave:**
1. **Nunca asumir** el formato de respuesta del backend
2. **Siempre implementar** múltiples estrategias de extracción
3. **Logging extensivo** es crucial para debugging
4. **Verificar en BD** después de operaciones complejas

## Próximas Características

### Roadmap Futuro

- **Exportación de datos** (CSV, Excel, PDF)
- **Importación masiva** de usuarios
- **Roles y permisos** granulares
- **Invitaciones por email**
- **Analytics de usuarios**
- **Historial de cambios**
- **Plantillas de usuario**
- **Internacionalización**

## Documentación Adicional

### Enlaces Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [React Icons - Phosphor](https://react-icons.github.io/react-icons/icons?name=pi)
- [Axios Documentation](https://axios-http.com/docs/intro)

### 🚨 **NOTA IMPORTANTE para el AI Assistant:**
Si trabajas en nuevos módulos de este proyecto, LEE PRIMERO esta sección de "PROBLEMAS CRÍTICOS RESUELTOS" y "LECCIONES APRENDIDAS". Te ahorrará horas de debugging y retrabajos. Los problemas documentados aquí ya fueron resueltos, no los repitas.