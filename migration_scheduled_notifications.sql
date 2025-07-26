-- Script para verificar y preparar el sistema de notificaciones programadas
-- Este script verifica que las tablas y columnas necesarias existan

-- 1. Verificar que la tabla scheduled_notifications existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scheduled_notifications') THEN
        RAISE EXCEPTION 'La tabla scheduled_notifications no existe. Debe crearla primero.';
    END IF;
END $$;

-- 2. Verificar que la tabla notifications existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE EXCEPTION 'La tabla notifications no existe. Debe crearla primero.';
    END IF;
END $$;

-- 3. Agregar columna 'sent' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_notifications' 
        AND column_name = 'sent'
    ) THEN
        ALTER TABLE scheduled_notifications ADD COLUMN sent BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna sent agregada a scheduled_notifications';
    END IF;
END $$;

-- 4. Agregar columna 'sent_at' si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_notifications' 
        AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE scheduled_notifications ADD COLUMN sent_at TIMESTAMP;
        RAISE NOTICE 'Columna sent_at agregada a scheduled_notifications';
    END IF;
END $$;

-- 5. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_due 
ON scheduled_notifications (target_date, sent, is_active);

-- 6. Verificar columnas requeridas en scheduled_notifications
DO $$
DECLARE
    required_columns TEXT[] := ARRAY[
        'id', 'table_id', 'record_id', 'column_id', 'target_date', 
        'notification_title', 'assigned_users', 'is_active', 'sent'
    ];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'scheduled_notifications' 
            AND column_name = col
        ) THEN
            RAISE EXCEPTION 'Columna requerida % no existe en scheduled_notifications', col;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Todas las columnas requeridas existen en scheduled_notifications';
END $$;

-- 7. Verificar columnas requeridas en notifications
DO $$
DECLARE
    required_columns TEXT[] := ARRAY['id', 'user_id', 'title', 'message', 'read', 'created_at'];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = col
        ) THEN
            RAISE EXCEPTION 'Columna requerida % no existe en notifications', col;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Todas las columnas requeridas existen en notifications';
END $$;

RAISE NOTICE 'Sistema de notificaciones programadas configurado correctamente';
