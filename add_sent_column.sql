-- Script para agregar la columna 'sent' a la tabla scheduled_notifications si no existe
-- Solo ejecutar si la columna 'sent' no existe en la tabla

-- Verificar si la columna existe antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scheduled_notifications' 
        AND column_name = 'sent'
    ) THEN
        ALTER TABLE scheduled_notifications ADD COLUMN sent BOOLEAN DEFAULT false;
        ALTER TABLE scheduled_notifications ADD COLUMN sent_at TIMESTAMP;
        
        -- Crear índice para mejorar consultas
        CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_sent 
        ON scheduled_notifications (sent, target_date);
        
        RAISE NOTICE 'Columnas sent y sent_at agregadas a scheduled_notifications';
    ELSE
        RAISE NOTICE 'La columna sent ya existe en scheduled_notifications';
    END IF;
END $$;

-- Comentarios para las nuevas columnas
COMMENT ON COLUMN scheduled_notifications.sent IS 'Indica si la notificación ya fue enviada';
COMMENT ON COLUMN scheduled_notifications.sent_at IS 'Fecha y hora en que se envió la notificación';
