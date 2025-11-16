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
        // Handle role field - ensure it's always a string
        role: String(backendUser.role || backendUser.role_name || backendUser.rol_name || 'Sin rol'),
        createdAt: backendUser.created_at || backendUser.createdAt,
        lastLogin: backendUser.last_login || backendUser.lastLogin,
        avatar: backendUser.avatar_url || backendUser.avatar,
        // If roles array is present, include it
        roles: backendUser.roles || [],
        // Preserve any other fields
        ...backendUser
    };
};

// Helper function to enrich user data with role information
const enrichUserWithRole = async (user) => {
    try {
        if (user.role && user.role !== 'user' && user.role !== 'undefined' && user.role !== null && user.role !== 'Sin rol') {
            // Si ya tiene un rol válido, no necesitamos buscar más
            return user;
        }

        // Intentar obtener roles del usuario desde user_roles
        const userRoles = await getUserRoles(user.id);

        if (userRoles && userRoles.length > 0) {
            // Tomar el primer rol (o podrías manejar múltiples roles)
            const primaryRole = userRoles[0];
            // Manejar el formato que viene del stored procedure: {rol_id: 1, rol_name: "Administrador"}
            const roleName = primaryRole.rol_name || primaryRole.name || primaryRole.role_name;

            if (roleName) {
                user.role = roleName;
            } else {
                user.role = 'Sin rol';
            }
        } else {
            // No hay roles asignados, usar 'Sin rol' por defecto
            user.role = 'Sin rol';
        }
    } catch (error) {
        console.warn(`Could not enrich user ${user.id} with role info:`, error.message);
        // Si no se puede obtener el rol, usar 'Sin rol' por defecto
        user.role = 'Sin rol';
    }

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
        const response = await axios.get('/users');
        const backendUsers = response.data;

        // Map backend data to frontend format
        const mappedUsers = backendUsers.map(mapUserFromBackend);

        // Enrich users with role information from user_roles table
        const enrichedUsers = await Promise.all(
            mappedUsers.map(user => enrichUserWithRole({ ...user }))
        );

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
        console.warn('Error connecting to backend:', error.message);

        // Si es error de token, significa que el backend está funcionando pero necesitas autenticación real
        if (error.response?.data?.error === 'Token requerido' || error.response?.status === 401) {
            console.info('🔐 Backend requiere autenticación.');
        }

        throw error;
    }
}

export async function getUserById(id) {
    try {
        const response = await axios.get(`/users/${id}`);
        const backendUser = response.data;

        // Map backend data to frontend format
        const mappedUser = mapUserFromBackend(backendUser);

        // Enrich with role information
        const enrichedUser = await enrichUserWithRole({ ...mappedUser });

        return enrichedUser;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error; // Propagar el error en lugar de retornar datos ficticios
    }
}

export async function createUser(userData) {
    try {
        // Mapear los datos al formato que espera el backend
        const backendData = {
            name: userData.name,
            email: userData.email,
            password_hash: userData.password, // El backend espera password_hash
            is_active: userData.isActive !== undefined ? userData.isActive : true, // Por defecto activo
            is_blocked: userData.isBlocked !== undefined ? userData.isBlocked : false // Por defecto no bloqueado
        };

        const response = await axios.post('/users', backendData);

        // Extraer ID del usuario de la respuesta
        let userId = null;
        let createdUser = null;

        if (response.data) {
            // Diferentes formatos de respuesta posibles
            if (response.data.user) {
                createdUser = response.data.user;
                userId = createdUser.id;
            } else if (response.data.id) {
                userId = response.data.id;
                createdUser = response.data;
            } else if (response.data.insertId) {
                userId = response.data.insertId;
            } else if (response.data.user_id) {
                userId = response.data.user_id;
            } else if (response.data.message) {
                // Intentar extraer ID del mensaje: "Usuario registrado exitosamente con ID: 7"
                const messageMatch = response.data.message.match(/ID:\s*(\d+)/i);
                if (messageMatch) {
                    userId = parseInt(messageMatch[1]);
                }
            }
        }

        // Si encontramos un ID de usuario y hay un rol para asignar
        if (userId && userData.role) {
            try {
                await assignRoleToUser(userId, userData.role);

                // Pequeño delay para que el backend procese la asignación
                await new Promise(resolve => setTimeout(resolve, 100));

                // Obtener el usuario actualizado con su rol
                try {
                    const updatedUser = await getUserById(userId);

                    return {
                        user: updatedUser,
                        message: 'Usuario creado correctamente',
                        roleAssigned: true
                    };
                } catch (fetchError) {
                    console.warn('Could not fetch updated user, but role was assigned:', fetchError.message);

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

                    return {
                        user: basicUser,
                        message: 'Usuario creado correctamente',
                        roleAssigned: true,
                        note: 'Role assigned but could not fetch complete user data'
                    };
                }
            } catch (roleError) {
                console.error('Failed to assign role to user:', roleError);

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

        const response = await axios.put(`/users/${id}`, backendData);

        // Si se cambió el rol, actualizar la asignación de roles
        if (userData.role) {
            try {
                // Aquí podrías necesitar primero eliminar roles existentes y luego asignar el nuevo
                // Dependiendo de cómo maneje tu backend la actualización de roles
                await assignRoleToUser(id, userData.role);
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
    const payload = {
        password_hash: passwordData.password_hash || passwordData.newPassword
    };
    const response = await axios.put(`/users/${id}/password`, payload);
    return response.data;
}

export async function deleteUser(id, tipo = 'logica') {
    const response = await axios.delete(`/users/${id}?tipo=${tipo}`);
    return response.data;
}

export async function setUserActiveStatus(id, isActive) {
    const response = await axios.put(`/users/${id}/active`, { activo: isActive });
    return response.data;
}

export async function blockUser(id) {
    const response = await axios.put(`/users/${id}/block`);
    return response.data;
}

export async function unblockUser(id) {
    const response = await axios.put(`/users/${id}/unblock`);
    return response.data;
}

export async function resetUserPasswordAdmin(id, newPassword) {
    const response = await axios.put(`/users/${id}/reset-password`, { password_hash: newPassword });
    return response.data;

}

export async function checkEmailExists(email) {
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
}

export async function setUserAvatar(id, avatarData) {
    const payload = {
        avatar_url: avatarData.avatar_url || avatarData.avatar
    };
    const response = await axios.put(`/users/${id}/avatar`, payload);
    return response.data;
}

// Obtener roles disponibles
export async function fetchRoles() {
    try {
        const response = await axios.get('/roles');
        const roles = response.data;

        // Mapear el formato del backend al formato esperado
        const mappedRoles = roles.map(role => ({
            id: role.rol_id || role.id,
            name: role.rol_name || role.name || role.role_name,
            label: getRoleDisplayName(role.rol_name || role.name || role.role_name)
        }));

        return mappedRoles;
    } catch (error) {
        console.warn('Error fetching roles from backend:', error.message);

        throw error;
    }
}

// Asignar rol a usuario usando la tabla user_roles
export async function assignRoleToUser(userId, roleName) {
    try {
        // Primero obtenemos todos los roles para encontrar el ID del rol por nombre
        const roles = await fetchRoles();

        const role = roles.find(r => r.name === roleName);

        if (!role) {
            console.error(`Role '${roleName}' not found. Available roles:`, roles.map(r => r.name));
            throw new Error(`Role '${roleName}' not found`);
        }

        // Primero eliminamos cualquier rol existente del usuario
        await removeUserRoles(userId);

        // Asignar el nuevo rol usando /roles/:id/assign
        const response = await axios.post(`/roles/${role.id}/assign`, {
            user_id: parseInt(userId)
        });

        return response.data;
    } catch (error) {
        console.error('Error assigning role to user:', error);

        // Si el endpoint principal falla, intentar métodos alternativos
        if (error.response?.status === 404 || error.response?.status === 500) {
            try {
                // Intentar insertar directamente usando insertUserRole
                const roles = await fetchRoles();
                const role = roles.find(r => r.name === roleName);
                if (role) {
                    const response = await insertUserRole(parseInt(userId), parseInt(role.id));
                    return response;
                }
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
        const response = await axios.get(`/roles/user/${userId}`);
        const userRoles = response.data;
        
        // Normalizar el formato de los roles
        const normalizedRoles = userRoles.map(role => ({
            id: role.rol_id || role.id,
            name: role.rol_name || role.name,
            // Mantener formato original también
            rol_id: role.rol_id || role.id,
            rol_name: role.rol_name || role.name
        }));
        
        return normalizedRoles;
    } catch (error) {
        console.warn('Error fetching user roles:', error.message);
        return [];
    }
}

// Función para eliminar todos los roles de un usuario
export async function removeUserRoles(userId) {
    try {
        // Primero obtener todos los roles del usuario
        const userRoles = await getUserRoles(userId);

        if (!userRoles || userRoles.length === 0) {
            return { message: 'No roles to remove' };
        }

        // Eliminar cada rol individualmente usando /roles/:id/remove
        const removePromises = userRoles.map(async (role) => {
            try {
                const roleId = role.id || role.role_id || role.rol_id;

                const response = await axios.delete(`/roles/${roleId}/remove`, {
                    data: { user_id: userId }
                });

                return { success: true, roleId, data: response.data };
            } catch (roleError) {
                console.error(`Error removing role ${role.id} from user ${userId}:`, roleError.message);
                return { success: false, roleId: role.id, error: roleError.message };
            }
        });

        const results = await Promise.allSettled(removePromises);

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
                const response = await axios.post(endpoint.url, endpoint.data);
                return response.data;
            } catch (endpointError) {
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