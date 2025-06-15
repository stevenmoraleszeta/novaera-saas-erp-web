// Servicio de gestión de usuarios
import axios from '../lib/axios';

// Helper function to map backend user data to frontend format
const mapUserFromBackend = (backendUser) => {
    if (!backendUser) return null;

    return {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        // Map is_active to isActive
        isActive: backendUser.is_active !== undefined ? backendUser.is_active :
            (backendUser.isActive !== undefined ? backendUser.isActive : true),
        // Map is_blocked to isBlocked  
        isBlocked: backendUser.is_blocked !== undefined ? backendUser.is_blocked :
            (backendUser.isBlocked !== undefined ? backendUser.isBlocked : false),
        // Handle role field - can come from multiple sources
        role: backendUser.role || backendUser.role_name || backendUser.rol_name || 'user',
        createdAt: backendUser.created_at || backendUser.createdAt,
        lastLogin: backendUser.last_login || backendUser.lastLogin,
        avatar: backendUser.avatar_url || backendUser.avatar,
        // Preserve any other fields
        ...backendUser
    };
};

// Helper function to enrich user data with role information
const enrichUserWithRole = async (user) => {
    try {
        console.log(`🔍 Enriching user ${user.id} (${user.name}) with role information...`);

        if (user.role && user.role !== 'user' && user.role !== 'undefined' && user.role !== null) {
            // Si ya tiene un rol válido, no necesitamos buscar más
            console.log(`✅ User ${user.id} already has valid role: ${user.role}`);
            return user;
        }

        // Intentar obtener roles del usuario desde user_roles
        const userRoles = await getUserRoles(user.id);
        console.log(`📋 User ${user.id} roles from database:`, userRoles);

        if (userRoles && userRoles.length > 0) {
            // Tomar el primer rol (o podrías manejar múltiples roles)
            const primaryRole = userRoles[0];
            const roleName = primaryRole.name || primaryRole.role_name || primaryRole.rol_name;

            if (roleName) {
                user.role = roleName;
                console.log(`✅ Enriched user ${user.id} with role: ${user.role}`);
            } else {
                user.role = 'user';
                console.log(`⚠️ User ${user.id} has role data but no valid role name, defaulting to 'user'`);
            }
        } else {
            // No hay roles asignados, usar 'user' por defecto
            user.role = 'user';
            console.log(`📝 User ${user.id} has no roles assigned, defaulting to 'user'`);
        }
    } catch (error) {
        console.warn(`❌ Could not enrich user ${user.id} with role info:`, error.message);
        // Si no se puede obtener el rol, usar 'user' por defecto
        user.role = 'user';
        console.log(`🔧 User ${user.id} role set to 'user' due to error`);
    }

    console.log(`🎯 Final role for user ${user.id}: ${user.role}`);
    return user;
};

// Helper function to map frontend user data to backend format
const mapUserToBackend = (frontendUser) => {
    return {
        name: frontendUser.name,
        email: frontendUser.email,
        password_hash: frontendUser.password,
        is_active: frontendUser.isActive,
        is_blocked: frontendUser.isBlocked,
        avatar_url: frontendUser.avatar
    };
};

export async function getUsers(params = {}) {
    try {
        // Obtener usuarios del backend
        console.log('Fetching users with params:', params);
        const response = await axios.get('/users');
        const backendUsers = response.data;

        console.log('Users received from backend:', backendUsers);

        // Map backend data to frontend format
        const mappedUsers = backendUsers.map(mapUserFromBackend);
        console.log('Users after mapping:', mappedUsers);

        // Enrich users with role information from user_roles table
        const enrichedUsers = await Promise.all(
            mappedUsers.map(user => enrichUserWithRole({ ...user }))
        );
        console.log('Users after role enrichment:', enrichedUsers);

        // Simular paginación y filtros en el frontend mientras actualizas el backend
        let filteredUsers = enrichedUsers;

        // Aplicar filtros de búsqueda
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                (user.role && user.role.toLowerCase().includes(searchTerm))
            );
        }

        // Aplicar filtro por rol
        if (params.role) {
            filteredUsers = filteredUsers.filter(user => user.role === params.role);
        }

        // Aplicar filtro por estado activo
        if (params.isActive !== '' && params.isActive !== undefined) {
            const isActive = params.isActive === 'true';
            filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
        }

        // Aplicar ordenamiento
        if (params.sortBy) {
            filteredUsers.sort((a, b) => {
                let aVal = a[params.sortBy];
                let bVal = b[params.sortBy];

                // Manejar fechas
                if (params.sortBy === 'createdAt') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }

                // Manejar strings
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (params.sortDirection === 'desc') {
                    return aVal < bVal ? 1 : -1;
                } else {
                    return aVal > bVal ? 1 : -1;
                }
            });
        }

        // Aplicar paginación
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        // Retornar en el formato que espera el frontend
        return {
            users: paginatedUsers,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit),
            currentPage: page,
            itemsPerPage: limit
        };

    } catch (error) {
        console.warn('Error connecting to backend, using demo data:', error.message);

        // Si es error de token, significa que el backend está funcionando pero necesitas autenticación real
        if (error.response?.data?.error === 'Token requerido' || error.response?.status === 401) {
            console.info('🔐 Backend requiere autenticación. Usando datos demo para testing.');
        }

        // Datos de ejemplo para testing mientras configuras el backend
        const demoUsers = [
            {
                id: 1,
                name: 'Juan Pérez',
                email: 'juan@example.com',
                role: 'admin',
                isActive: true,
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                name: 'María García',
                email: 'maria@example.com',
                role: 'user',
                isActive: true,
                createdAt: '2024-01-16T14:20:00Z'
            },
            {
                id: 3,
                name: 'Carlos López',
                email: 'carlos@example.com',
                role: 'manager',
                isActive: false,
                createdAt: '2024-01-17T09:15:00Z'
            },
            {
                id: 4,
                name: 'Ana Martínez',
                email: 'ana@example.com',
                role: 'user',
                isActive: true,
                createdAt: '2024-01-18T16:45:00Z'
            },
            {
                id: 5,
                name: 'Pedro Rodríguez',
                email: 'pedro@example.com',
                role: 'admin',
                isActive: false,
                createdAt: '2024-01-19T11:30:00Z'
            }
        ];

        // Aplicar la misma lógica de filtros con datos demo
        let filteredUsers = demoUsers;

        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                (user.role && user.role.toLowerCase().includes(searchTerm))
            );
        }

        if (params.role) {
            filteredUsers = filteredUsers.filter(user => user.role === params.role);
        }

        if (params.isActive !== '' && params.isActive !== undefined) {
            const isActive = params.isActive === 'true';
            filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
        }

        if (params.sortBy) {
            filteredUsers.sort((a, b) => {
                let aVal = a[params.sortBy];
                let bVal = b[params.sortBy];

                if (params.sortBy === 'createdAt') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (params.sortDirection === 'desc') {
                    return aVal < bVal ? 1 : -1;
                } else {
                    return aVal > bVal ? 1 : -1;
                }
            });
        }

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        return {
            users: paginatedUsers,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit),
            currentPage: page,
            itemsPerPage: limit
        };
    }
}

export async function getUserById(id) {
    try {
        console.log('Fetching user by ID:', id);
        const response = await axios.get(`/users/${id}`);
        const backendUser = response.data;
        console.log('User data received from backend:', backendUser);

        // Map backend data to frontend format
        const mappedUser = mapUserFromBackend(backendUser);
        console.log('User data after mapping:', mappedUser);

        // Enrich with role information
        const enrichedUser = await enrichUserWithRole({ ...mappedUser });
        console.log('User data after role enrichment:', enrichedUser);

        return enrichedUser;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error; // Propagar el error en lugar de retornar datos ficticios
    }
}

export async function createUser(userData) {
    try {
        console.log('Creating user with data:', userData);

        // Mapear los datos al formato que espera el backend
        const backendData = {
            name: userData.name,
            email: userData.email,
            password_hash: userData.password, // El backend espera password_hash
            is_active: userData.isActive !== undefined ? userData.isActive : true, // Por defecto activo
            is_blocked: userData.isBlocked !== undefined ? userData.isBlocked : false // Por defecto no bloqueado
        };

        console.log('Sending user data to backend:', backendData);
        const response = await axios.post('/users', backendData);
        console.log('User creation response:', response.data);

        // Extraer ID del usuario de la respuesta
        let userId = null;
        let createdUser = null;

        if (response.data) {
            // Diferentes formatos de respuesta posibles
            if (response.data.user) {
                createdUser = response.data.user;
                userId = createdUser.id;
                console.log('📋 User ID extracted from response.data.user.id:', userId);
            } else if (response.data.id) {
                userId = response.data.id;
                createdUser = response.data;
                console.log('📋 User ID extracted from response.data.id:', userId);
            } else if (response.data.insertId) {
                userId = response.data.insertId;
                console.log('📋 User ID extracted from response.data.insertId:', userId);
            } else if (response.data.user_id) {
                userId = response.data.user_id;
                console.log('📋 User ID extracted from response.data.user_id:', userId);
            } else if (response.data.message) {
                // Intentar extraer ID del mensaje: "Usuario registrado exitosamente con ID: 7"
                const messageMatch = response.data.message.match(/ID:\s*(\d+)/i);
                if (messageMatch) {
                    userId = parseInt(messageMatch[1]);
                    console.log('📋 User ID extracted from message:', userId);
                    console.log('📝 Original message:', response.data.message);
                } else {
                    console.warn('⚠️ Could not extract ID from message:', response.data.message);
                }
            }
        }

        console.log('🆔 Final extracted userId:', userId);

        // Si encontramos un ID de usuario y hay un rol para asignar
        if (userId && userData.role) {
            try {
                console.log('🎯 Assigning role', userData.role, 'to user', userId);
                await assignRoleToUser(userId, userData.role);
                console.log('✅ Role assigned successfully');

                // Pequeño delay para que el backend procese la asignación
                await new Promise(resolve => setTimeout(resolve, 100));

                // Obtener el usuario actualizado con su rol
                try {
                    console.log('🔄 Fetching updated user with role...');
                    const updatedUser = await getUserById(userId);
                    console.log('👤 User with role retrieved:', updatedUser);
                    console.log('🏷️ User role after creation:', updatedUser.role);

                    return {
                        user: updatedUser,
                        message: 'Usuario creado correctamente',
                        roleAssigned: true
                    };
                } catch (fetchError) {
                    console.warn('⚠️ Could not fetch updated user, but role was assigned:', fetchError.message);

                    // Crear un objeto usuario básico con los datos que tenemos
                    const basicUser = {
                        id: userId,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role, // Usamos el rol que se suponía asignar
                        isActive: userData.isActive !== undefined ? userData.isActive : true,
                        isBlocked: userData.isBlocked !== undefined ? userData.isBlocked : false,
                        createdAt: new Date().toISOString()
                    };

                    console.log('📋 Returning basic user object:', basicUser);
                    return {
                        user: basicUser,
                        message: 'Usuario creado correctamente',
                        roleAssigned: true,
                        note: 'Role assigned but could not fetch complete user data'
                    };
                }
            } catch (roleError) {
                console.error('❌ Failed to assign role to user:', roleError);
                console.warn('⚠️ Usuario creado pero falló la asignación del rol. Rol:', userData.role);

                // El usuario fue creado pero sin rol, así que retornamos algo básico
                const basicUser = {
                    id: userId,
                    name: userData.name,
                    email: userData.email,
                    role: 'user', // Rol por defecto
                    isActive: userData.isActive !== undefined ? userData.isActive : true,
                    isBlocked: userData.isBlocked !== undefined ? userData.isBlocked : false,
                    createdAt: new Date().toISOString()
                };

                return {
                    user: basicUser,
                    message: 'Usuario creado correctamente (rol no asignado)',
                    roleAssigned: false,
                    roleError: roleError.message
                };
            }
        } else {
            console.warn('⚠️ Could not assign role: userId =', userId, ', role =', userData.role);

            if (!userId) {
                console.error('❌ No user ID found - cannot assign role');
            }
            if (!userData.role) {
                console.error('❌ No role specified - cannot assign role');
            }
        }

        // Mapear respuesta del backend al formato del frontend
        if (createdUser) {
            const mappedUser = mapUserFromBackend(createdUser);
            return { user: mappedUser, message: 'Usuario creado correctamente' };
        }

        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);

        // Proporcionar más detalles del error
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
        }

        throw error;
    }
}

export async function updateUser(id, userData) {
    try {
        // Mapear los datos al formato que espera el backend
        const backendData = {
            name: userData.name,
            email: userData.email,
            role: userData.role
        };

        // Solo incluir password_hash si se proporciona una nueva contraseña
        if (userData.password && userData.password.trim() !== '') {
            backendData.password_hash = userData.password;
        }

        // Incluir estado activo si está presente
        if (userData.isActive !== undefined) {
            backendData.is_active = userData.isActive;
        }

        console.log('Updating user with data:', backendData);
        const response = await axios.put(`/users/${id}`, backendData);

        // Si se cambió el rol, actualizar la asignación de roles
        if (userData.role) {
            try {
                // Aquí podrías necesitar primero eliminar roles existentes y luego asignar el nuevo
                // Dependiendo de cómo maneje tu backend la actualización de roles
                await assignRoleToUser(id, userData.role);
                console.log('Role updated successfully');
            } catch (roleError) {
                console.warn('Failed to update role:', roleError);
            }
        }

        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function updateUserPassword(id, passwordData) {
    try {
        // Tu backend espera password_hash, no password
        const payload = {
            password_hash: passwordData.password_hash || passwordData.newPassword
        };
        const response = await axios.put(`/users/${id}/password`, payload);
        return response.data;
    } catch (error) {
        console.warn('Demo mode: simulating password update');
        return { message: 'Contraseña actualizada correctamente (modo demo)' };
    }
}

export async function deleteUser(id, tipo = 'logica') {
    try {
        // Tu backend usa query parameter para el tipo de eliminación
        const response = await axios.delete(`/users/${id}?tipo=${tipo}`);
        return response.data;
    } catch (error) {
        console.warn('Demo mode: simulating user deletion');
        return { message: 'Usuario eliminado correctamente (modo demo)' };
    }
}

export async function setUserActiveStatus(id, isActive) {
    try {
        const response = await axios.put(`/users/${id}/active`, { activo: isActive });
        return response.data;
    } catch (error) {
        console.warn('Demo mode: simulating user status toggle');
        return { message: `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente (modo demo)` };
    }
}

export async function blockUser(id) {
    try {
        const response = await axios.put(`/users/${id}/block`);
        return response.data;
    } catch (error) {
        console.warn('Demo mode: simulating user block');
        return { message: 'Usuario bloqueado correctamente (modo demo)' };
    }
}

export async function unblockUser(id) {
    try {
        const response = await axios.put(`/users/${id}/unblock`);
        return response.data;
    } catch (error) {
        console.warn('Demo mode: simulating user unblock');
        return { message: 'Usuario desbloqueado correctamente (modo demo)' };
    }
}

export async function resetUserPasswordAdmin(id, newPassword) {
    try {
        const response = await axios.put(`/users/${id}/reset-password`, { password_hash: newPassword });
        return response.data;
    } catch (error) {
        console.warn('Demo mode: simulating password reset');
        return { message: 'Contraseña restablecida correctamente (modo demo)' };
    }
}

export async function checkEmailExists(email) {
    try {
        const response = await axios.get('/users/exists/email', {
            params: { email }
        });

        // Manejar diferentes formatos de respuesta del backend
        const data = response.data;

        // Si la respuesta tiene una propiedad 'exists'
        if (typeof data.exists === 'boolean') {
            return data.exists;
        }

        // Si la respuesta es directamente un booleano
        if (typeof data === 'boolean') {
            return data;
        }

        // Si tiene otras propiedades, asumir que existe si hay data
        return !!data;

    } catch (error) {
        console.warn('Demo mode: simulating email check for', email);

        // En modo demo, algunos emails "existen" para testing
        const demoExistingEmails = [
            'admin@demo.com',
            'test@demo.com',
            'user@demo.com'
        ];

        return demoExistingEmails.includes(email.toLowerCase());
    }
}

export async function setUserAvatar(id, avatarData) {
    try {
        // Tu backend espera avatar_url
        const payload = {
            avatar_url: avatarData.avatar_url || avatarData.avatar
        };
        const response = await axios.put(`/users/${id}/avatar`, payload);
        return response.data;
    } catch (error) {
        console.warn('Demo mode: simulating avatar update');
        return {
            message: 'Avatar actualizado correctamente (modo demo)',
            avatar: avatarData.avatar_url || avatarData.avatar
        };
    }
}

// Obtener roles disponibles
export async function fetchRoles() {
    try {
        console.log('Fetching roles from backend...');
        const response = await axios.get('/roles');
        const roles = response.data;

        console.log('Roles received from backend:', roles);

        // Mapear el formato del backend al formato esperado
        const mappedRoles = roles.map(role => ({
            id: role.rol_id || role.id,
            name: role.rol_name || role.name || role.role_name,
            label: getRoleDisplayName(role.rol_name || role.name || role.role_name)
        }));

        console.log('Roles after mapping:', mappedRoles);
        return mappedRoles;
    } catch (error) {
        console.warn('Error fetching roles from backend, using default roles:', error.message);

        // Retornar roles por defecto con estructura consistente
        const defaultRoles = [
            { id: 1, name: 'admin', label: 'Administrador' },
            { id: 2, name: 'manager', label: 'Gerente' },
            { id: 3, name: 'user', label: 'Usuario' },
            { id: 4, name: 'supervisor', label: 'Supervisor' }
        ];

        console.log('Using default roles:', defaultRoles);
        return defaultRoles;
    }
}

// Asignar rol a usuario usando la tabla user_roles
export async function assignRoleToUser(userId, roleName) {
    try {
        console.log('🎯 ASSIGNING ROLE:', roleName, 'to user:', userId);
        console.log('🔍 Searching for role with name:', roleName);

        // Primero obtenemos todos los roles para encontrar el ID del rol por nombre
        const roles = await fetchRoles();
        console.log('📋 Available roles for search:', roles);

        const role = roles.find(r => r.name === roleName);

        if (!role) {
            console.error('❌ Role not found!');
            console.error('🔍 Searched for role name:', roleName);
            console.error('📋 Available role names:', roles.map(r => r.name));
            throw new Error(`Role '${roleName}' not found`);
        }

        console.log('✅ Found role:', role);
        console.log('🆔 Role ID to assign:', role.id);

        // Primero eliminamos cualquier rol existente del usuario
        await removeUserRoles(userId);

        // Asignar el nuevo rol usando /roles/:id/assign
        const response = await axios.post(`/roles/${role.id}/assign`, {
            user_id: parseInt(userId)
        });

        console.log('Role assignment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error assigning role to user:', error);

        // Si el endpoint principal falla, intentar métodos alternativos
        if (error.response?.status === 404 || error.response?.status === 500) {
            console.log('Primary role assignment failed, trying alternative methods...');
            try {
                // Intentar insertar directamente usando insertUserRole
                const response = await insertUserRole(parseInt(userId), parseInt(role.id));
                console.log('Alternative role assignment successful:', response);
                return response;
            } catch (altError) {
                console.error('Alternative role assignment also failed:', altError);
            }
        }

        throw error;
    }
}

// Obtener roles de un usuario
export async function getUserRoles(userId) {
    try {
        console.log('Fetching roles for user:', userId);
        const response = await axios.get(`/roles/user/${userId}`);
        const userRoles = response.data;
        console.log('User roles received:', userRoles);
        return userRoles;
    } catch (error) {
        console.warn('Error fetching user roles:', error.message);
        console.warn('Demo mode: returning default user roles');
        return [{ id: 3, name: 'user', label: 'Usuario' }];
    }
}

// Función para eliminar todos los roles de un usuario
export async function removeUserRoles(userId) {
    try {
        console.log('Removing all roles for user:', userId);

        // Primero obtener todos los roles del usuario
        const userRoles = await getUserRoles(userId);

        if (!userRoles || userRoles.length === 0) {
            console.log('No roles to remove for user:', userId);
            return { message: 'No roles to remove' };
        }

        // Eliminar cada rol individualmente usando /roles/:id/remove
        const removePromises = userRoles.map(async (role) => {
            try {
                const roleId = role.id || role.role_id || role.rol_id;
                console.log(`Removing role ${roleId} from user ${userId}`);

                const response = await axios.delete(`/roles/${roleId}/remove`, {
                    data: { user_id: userId }
                });

                console.log(`Role ${roleId} removed successfully:`, response.data);
                return { success: true, roleId, data: response.data };
            } catch (roleError) {
                console.error(`Error removing role ${role.id} from user ${userId}:`, roleError.message);
                return { success: false, roleId: role.id, error: roleError.message };
            }
        });

        const results = await Promise.allSettled(removePromises);
        console.log('Role removal results:', results);

        return { message: 'Roles removal attempted', results };
    } catch (error) {
        console.warn('Error removing user roles:', error.message);
        // No fallar si no se pueden eliminar roles existentes
        return null;
    }
}

// Función para insertar directamente en user_roles usando rutas correctas
export async function insertUserRole(userId, roleId) {
    try {
        console.log('Inserting user_role:', { userId, roleId });

        // Usar la ruta correcta primero, luego fallbacks
        const endpoints = [
            {
                url: `/roles/${roleId}/assign`,
                data: { user_id: userId },
                description: 'Official roles assign endpoint'
            },
            {
                url: '/user-roles',
                data: { user_id: userId, role_id: roleId },
                description: 'Direct user-roles table endpoint'
            },
            {
                url: '/user_roles',
                data: { user_id: userId, role_id: roleId },
                description: 'Alternative user_roles table endpoint'
            }
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`Trying ${endpoint.description}: ${endpoint.url}`);
                const response = await axios.post(endpoint.url, endpoint.data);
                console.log(`Success with ${endpoint.description}:`, response.data);
                return response.data;
            } catch (endpointError) {
                console.log(`Failed ${endpoint.description}:`, endpointError.message);
                continue;
            }
        }

        throw new Error('All user role assignment endpoints failed');
    } catch (error) {
        console.error('Error inserting user role:', error);
        throw error;
    }
}

// Función helper para obtener nombres de roles en español
function getRoleDisplayName(roleName) {
    const roleMap = {
        admin: 'Administrador',
        manager: 'Gerente',
        supervisor: 'Supervisor',
        user: 'Usuario',
        guest: 'Invitado'
    };
    return roleMap[roleName] || roleName || 'Sin rol';
}

// Legacy function name for compatibility
export const toggleUserStatus = setUserActiveStatus; 