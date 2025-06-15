// debugUtils.js - Utility functions for debugging user and role issues
import { fetchRoles, getUserRoles, insertUserRole } from '../services/userService';
import axios from '../lib/axios';

// Debug function to check role structure
export async function debugRoles() {
    console.log('🔍 DEBUGGING ROLES');
    console.log('==================');

    try {
        const roles = await fetchRoles();
        console.log('Roles fetched:', roles);

        // Verificar estructura
        roles.forEach(role => {
            console.log(`Role ID: ${role.id}, Name: ${role.name}, Label: ${role.label}`);
        });

        return roles;
    } catch (error) {
        console.error('Error debugging roles:', error);
        return [];
    }
}

// Debug function to check user structure from backend
export async function debugUsers() {
    console.log('🔍 DEBUGGING USERS');
    console.log('==================');

    try {
        const response = await axios.get('/users');
        const users = response.data;

        console.log('Raw users from backend:', users);

        if (users && users.length > 0) {
            const firstUser = users[0];
            console.log('First user structure:', firstUser);
            console.log('Field mapping check:');
            console.log('- is_active:', firstUser.is_active);
            console.log('- isActive:', firstUser.isActive);
            console.log('- is_blocked:', firstUser.is_blocked);
            console.log('- isBlocked:', firstUser.isBlocked);
            console.log('- role:', firstUser.role);
            console.log('- role_name:', firstUser.role_name);
            console.log('- rol_name:', firstUser.rol_name);
        }

        return users;
    } catch (error) {
        console.error('Error debugging users:', error);
        return [];
    }
}

// Debug function to check user-role relationships
export async function debugUserRoles(userId) {
    console.log(`🔍 DEBUGGING USER ROLES FOR USER: ${userId}`);
    console.log('=================================');

    try {
        const userRoles = await getUserRoles(userId);
        console.log('User roles:', userRoles);

        if (userRoles && userRoles.length > 0) {
            userRoles.forEach(role => {
                console.log(`Role for user ${userId}:`, role);
            });
        } else {
            console.log(`No roles found for user ${userId}`);
        }

        return userRoles;
    } catch (error) {
        console.error('Error debugging user roles:', error);
        return [];
    }
}

// Function to manually assign role to user (for testing)
export async function testRoleAssignment(userId, roleName) {
    console.log(`🔧 TESTING ROLE ASSIGNMENT: User ${userId} -> Role ${roleName}`);
    console.log('=======================================================');

    try {
        // Obtener roles disponibles
        const roles = await fetchRoles();
        const role = roles.find(r => r.name === roleName);

        if (!role) {
            throw new Error(`Role ${roleName} not found`);
        }

        console.log('Found role:', role);

        // Intentar asignar el rol usando la ruta correcta
        console.log(`Assigning role ${role.id} to user ${userId} using /roles/${role.id}/assign`);
        const response = await axios.post(`/roles/${role.id}/assign`, {
            user_id: parseInt(userId)
        });
        console.log('Role assignment result:', response.data);

        // Verificar que se asignó correctamente
        const userRoles = await getUserRoles(userId);
        console.log('User roles after assignment:', userRoles);

        return { success: true, userRoles, assignmentResult: response.data };
    } catch (error) {
        console.error('Error in test role assignment:', error);

        // Si falla, intentar con insertUserRole como fallback
        try {
            console.log('Trying fallback method...');
            const fallbackResult = await insertUserRole(userId, role.id);
            console.log('Fallback assignment result:', fallbackResult);

            const userRoles = await getUserRoles(userId);
            console.log('User roles after fallback assignment:', userRoles);

            return { success: true, userRoles, fallbackUsed: true };
        } catch (fallbackError) {
            console.error('Fallback assignment also failed:', fallbackError);
            return { success: false, error: error.message, fallbackError: fallbackError.message };
        }
    }
}

// Function to check all users and their roles
export async function debugAllUsersAndRoles() {
    console.log('🔍 DEBUGGING ALL USERS AND THEIR ROLES');
    console.log('======================================');

    try {
        const users = await debugUsers();

        for (const user of users) {
            console.log(`\n--- User: ${user.name} (ID: ${user.id}) ---`);
            await debugUserRoles(user.id);
        }

        return users;
    } catch (error) {
        console.error('Error debugging all users and roles:', error);
        return [];
    }
}

// Function to create default roles if they don't exist
export async function ensureDefaultRoles() {
    console.log('🔧 ENSURING DEFAULT ROLES EXIST');
    console.log('===============================');

    const defaultRoles = [
        { name: 'admin', description: 'Administrador del sistema' },
        { name: 'manager', description: 'Gerente' },
        { name: 'user', description: 'Usuario estándar' },
        { name: 'supervisor', description: 'Supervisor' }
    ];

    try {
        for (const roleData of defaultRoles) {
            try {
                const response = await axios.post('/roles', roleData);
                console.log(`Created role: ${roleData.name}`, response.data);
            } catch (error) {
                if (error.response?.status === 409 || error.response?.status === 400) {
                    console.log(`Role ${roleData.name} already exists`);
                } else {
                    console.error(`Error creating role ${roleData.name}:`, error.message);
                }
            }
        }

        // Verificar roles después de la creación
        const roles = await fetchRoles();
        console.log('Roles after ensuring defaults:', roles);

        return roles;
    } catch (error) {
        console.error('Error ensuring default roles:', error);
        return [];
    }
}

// Function to assign default 'user' role to users without roles
export async function assignDefaultRolesToUsers() {
    console.log('👥 ASSIGNING DEFAULT ROLES TO USERS WITHOUT ROLES');
    console.log('================================================');

    try {
        // Obtener todos los usuarios directamente del backend
        const response = await axios.get('/users');
        const users = response.data;

        // Obtener todos los roles para encontrar el rol 'user'
        const roles = await fetchRoles();
        const userRole = roles.find(r => r.name === 'user');

        if (!userRole) {
            console.error('❌ Default "user" role not found! Create roles first.');
            return { error: 'User role not found' };
        }

        console.log(`📋 Found user role:`, userRole);

        const results = [];

        for (const user of users) {
            console.log(`\n👤 Checking user: ${user.name} (ID: ${user.id})`);

            try {
                // Verificar si ya tiene roles
                const userRoles = await getUserRoles(user.id);

                if (!userRoles || userRoles.length === 0) {
                    console.log(`📝 User ${user.id} has no roles, assigning 'user' role...`);

                    // Asignar rol 'user'
                    const assignResult = await axios.post(`/roles/${userRole.id}/assign`, {
                        user_id: parseInt(user.id)
                    });

                    console.log(`✅ Assigned 'user' role to ${user.name}:`, assignResult.data);
                    results.push({
                        userId: user.id,
                        userName: user.name,
                        success: true,
                        action: 'assigned',
                        role: 'user'
                    });
                } else {
                    console.log(`✅ User ${user.id} already has roles:`, userRoles.map(r => r.rol_name || r.name));
                    results.push({
                        userId: user.id,
                        userName: user.name,
                        success: true,
                        action: 'skipped',
                        existingRoles: userRoles
                    });
                }
            } catch (userError) {
                console.error(`❌ Error processing user ${user.id}:`, userError.message);
                results.push({
                    userId: user.id,
                    userName: user.name,
                    success: false,
                    error: userError.message
                });
            }
        }

        console.log('\n📊 SUMMARY:');
        console.log('============');

        const assigned = results.filter(r => r.action === 'assigned');
        const skipped = results.filter(r => r.action === 'skipped');
        const errors = results.filter(r => !r.success);

        console.log(`✅ Roles assigned: ${assigned.length}`);
        console.log(`⏭️ Users skipped: ${skipped.length}`);
        console.log(`❌ Errors: ${errors.length}`);

        if (assigned.length > 0) {
            console.log('\n👥 Users that received roles:');
            assigned.forEach(r => console.log(`- ${r.userName} (ID: ${r.userId})`));
        }

        return { results, summary: { assigned: assigned.length, skipped: skipped.length, errors: errors.length } };

    } catch (error) {
        console.error('❌ Error assigning default roles:', error);
        return { error: error.message };
    }
}

// Function to test role API endpoints
export async function testRoleEndpoints() {
    console.log('🔗 TESTING ROLE API ENDPOINTS');
    console.log('=============================');

    try {
        // Test GET /roles
        console.log('\n📋 Testing GET /roles...');
        const rolesResponse = await axios.get('/roles');
        console.log('✅ GET /roles successful:', rolesResponse.data);

        // Test GET /roles/user/:user_id for first user
        const users = await axios.get('/users');
        if (users.data && users.data.length > 0) {
            const firstUserId = users.data[0].id;
            console.log(`\n👤 Testing GET /roles/user/${firstUserId}...`);

            try {
                const userRolesResponse = await axios.get(`/roles/user/${firstUserId}`);
                console.log(`✅ GET /roles/user/${firstUserId} successful:`, userRolesResponse.data);
            } catch (userRoleError) {
                console.log(`❌ GET /roles/user/${firstUserId} failed:`, userRoleError.message);
            }
        }

        console.log('\n🔗 Available role endpoints:');
        console.log('- GET /roles - Get all roles');
        console.log('- GET /roles/:id - Get role by ID');
        console.log('- POST /roles - Create new role');
        console.log('- GET /roles/user/:user_id - Get roles for user');
        console.log('- POST /roles/:id/assign - Assign role to user');
        console.log('- DELETE /roles/:id/remove - Remove role from user');

    } catch (error) {
        console.error('❌ Error testing role endpoints:', error);
    }
}

// Quick function to check user roles after changes
export async function quickUserRoleCheck() {
    console.log('⚡ QUICK USER ROLE CHECK');
    console.log('========================');

    try {
        const response = await axios.get('/users');
        const users = response.data;

        console.log('\n👥 Current users and their roles:');
        console.log('=================================');

        for (const user of users) {
            try {
                const userRoles = await getUserRoles(user.id);
                const roleNames = userRoles.map(r => r.rol_name || r.name).join(', ') || 'No roles';
                const status = user.is_active ? '🟢 Active' : '🔴 Inactive';

                console.log(`${user.id}. ${user.name} - Roles: [${roleNames}] - Status: ${status}`);
            } catch (error) {
                console.log(`${user.id}. ${user.name} - ❌ Error getting roles: ${error.message}`);
            }
        }

        console.log('\n✅ Quick check complete!');
    } catch (error) {
        console.error('❌ Error in quick check:', error);
    }
}

// Function to test user creation with specific role
export async function testUserCreation(roleName = 'admin') {
    console.log(`👤 TESTING USER CREATION WITH ROLE: ${roleName}`);
    console.log('===============================================');

    try {
        // Step 1: Check available roles
        console.log('\n📋 Step 1: Checking available roles...');
        const roles = await fetchRoles();
        console.log('Available roles:', roles);

        const targetRole = roles.find(r => r.name === roleName);
        if (!targetRole) {
            console.error(`❌ Role "${roleName}" not found in available roles!`);
            return { error: `Role "${roleName}" not found` };
        }
        console.log(`✅ Target role found:`, targetRole);

        // Step 2: Test role assignment directly
        console.log('\n🔗 Step 2: Testing direct role assignment...');

        // Get a test user (first user)
        const usersResponse = await axios.get('/users');
        const testUser = usersResponse.data[0];

        if (testUser) {
            console.log(`Testing with user: ${testUser.name} (ID: ${testUser.id})`);

            try {
                // Test assignment
                const assignResult = await axios.post(`/roles/${targetRole.id}/assign`, {
                    user_id: parseInt(testUser.id)
                });
                console.log('✅ Direct assignment successful:', assignResult.data);

                // Verify assignment
                const userRoles = await getUserRoles(testUser.id);
                console.log('User roles after assignment:', userRoles);

            } catch (assignError) {
                console.error('❌ Direct assignment failed:', assignError.message);
            }
        }

        console.log('\n🎯 Step 3: Testing user creation flow...');
        console.log('This should be done through the UI form to test the complete flow');
        console.log('1. Open the user creation modal');
        console.log(`2. Select role: ${roleName}`);
        console.log('3. Fill other fields and submit');
        console.log('4. Check console logs for role assignment process');

        return { success: true, targetRole, availableRoles: roles };

    } catch (error) {
        console.error('❌ Error testing user creation:', error);
        return { error: error.message };
    }
}

// Function to run complete diagnosis
export async function runCompleteDiagnosis() {
    console.log('🩺 RUNNING COMPLETE DIAGNOSIS');
    console.log('=============================');

    try {
        await testRoleEndpoints();
        await debugRoles();
        await debugUsers();
        await debugAllUsersAndRoles();

        console.log('\n✅ Diagnosis complete! Check the console logs above for details.');
        console.log('\n💡 Quick commands:');
        console.log('- window.assignDefaultRoles() - Fix users without roles');
        console.log('- window.quickCheck() - Quick status check');
        console.log('- window.testUserCreation("admin") - Test user creation with admin role');
        console.log('- location.reload() - Reload page to see changes');
    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
    }
} 