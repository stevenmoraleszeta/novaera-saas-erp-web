# root
```js
app.use('/api/auth', authRoutes); 

app.use(authMiddleware);

app.use('/api/modules', modulesRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/columns', columnsRoutes);
app.use('/records/', recordsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/notifications', notificationsRoutes);
```
# users
```js
router.get('/', usersController.getUsers);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.put('/:id/password', usersController.updatePassword);
router.delete('/:id', usersController.deleteUser);
router.put('/:id/block', usersController.blockUser);
router.put('/:id/unblock', usersController.unblockUser);
router.put('/:id/active', usersController.setActiveStatus);
router.put('/:id/reset-password', usersController.resetPasswordAdmin);
router.get('/exists/email', usersController.existsByEmail);
router.put('/:id/avatar', usersController.setAvatar);
```
# tables
```js
router.post('/', tablesController.createTable);
router.get('/module/:module_id', tablesController.getTablesByModule);
router.get('/:table_id', tablesController.getTableById);
router.put('/:table_id', tablesController.updateTable);
router.delete('/:table_id', tablesController.deleteTable);
router.get('/exists/name', tablesController.existsTableNameInModule);
```
# roles
```js
router.get('/', rolesController.getRoles);
router.post('/', rolesController.createRole);
router.get('/:id', rolesController.getRoleById);
router.post('/:id/assign', rolesController.assignRoleToUser);
router.delete('/:id/remove', rolesController.removeRoleFromUser);
router.get('/user/:user_id', rolesController.getRolesByUser);
router.post('/:id/permissions', rolesController.setRolePermissions);
router.put('/:id/permissions', rolesController.updateRolePermissions);
router.get('/:id/permissions/:table_id', rolesController.getRolePermissions);
router.delete('/:id/permissions/:table_id', rolesController.deleteRolePermissions);
```
# records
```js
router.post('/', recordsController.createRecord);
router.get('/table/:table_id', recordsController.getRecordsByTable);
router.get('/:record_id', recordsController.getRecordById);
router.put('/:record_id', recordsController.updateRecord);
router.delete('/:record_id', recordsController.deleteRecord);
router.get('/table/:table_id/search', recordsController.searchRecordsByValue);
router.get('/table/:table_id/count', recordsController.countRecordsByTable);
router.get('/table/:table_id/exists-field', recordsController.existsFieldInRecords);
```
# permissions
```js
router.get('/', permissionsController.getPermissions);
router.post('/', permissionsController.createPermission);
router.get('/role/:role_id/table/:table_id', permissionsController.getRoleTablePermissions);
router.delete('/role/:role_id/table/:table_id', permissionsController.deleteRoleTablePermissions);
router.get('/table/:table_id/users', permissionsController.getUsersWithPermissions);
router.post('/table/:table_id/roles', permissionsController.assignMassivePermissions);
router.delete('/table/:table_id', permissionsController.deleteAllPermissionsByTable);
```
# notifications
```js
router.get('/', notificationsController.getNotifications);
router.post('/', notificationsController.createNotification);
router.get('/user/:user_id', notificationsController.getNotificationsByUser);
router.put('/:notification_id/read', notificationsController.markAsRead);
router.put('/user/:user_id/read-all', notificationsController.markAllAsRead);
router.delete('/:notification_id', notificationsController.deleteNotification);
router.delete('/user/:user_id', notificationsController.deleteAllNotifications);
router.get('/user/:user_id/unread-count', notificationsController.countUnread);
router.post('/massive', notificationsController.createMassiveNotifications);
```
# modules
```js
router.get('/', modulesController.getModules);
router.post('/', modulesController.createModule);
router.get('/:id', modulesController.getModuleById);
router.put('/:id', modulesController.updateModule);
router.delete('/:id', modulesController.deleteModule);
router.get('/exists/table-name', modulesController.existsTableNameInModule);
```
# columns
```js
router.get('/', columnsController.getColumns);
router.post('/', columnsController.createColumn);
router.get('/table/:table_id', columnsController.getColumnsByTable);
router.get('/:column_id', columnsController.getColumnById);
router.put('/:column_id', columnsController.updateColumn);
router.delete('/:column_id', columnsController.deleteColumn);
router.get('/table/:table_id/exists-name', columnsController.existsColumnNameInTable);
router.get('/:column_id/has-records', columnsController.columnHasRecords);
```
# auth
```js
router.post('/login', authController.login);
router.get('/me', authController.me);
router.post('/logout', authController.logout);
router.post('/register', authController.register);
```
