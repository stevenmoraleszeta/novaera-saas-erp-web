import React, { useState, useEffect } from 'react';
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications';
import Button from '@/components/commmon/Button';
import Table from '@/components/commmon/Table';
import Modal from '@/components/commmon/Modal';

const RecordSubscriptionsManager = ({ tableId, recordId }) => {
  const { 
    subscriptions, 
    loading, 
    subscribeToRecord, 
    deleteSubscription,
    checkSubscription,
    loadSubscriptions
  } = useScheduledNotifications(tableId);

  const [subscriptionForm, setSubscriptionForm] = useState({
    notification_types: ['create', 'update', 'delete'],
    is_active: true
  });
  const [showForm, setShowForm] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    if (tableId && recordId) {
      checkCurrentSubscription();
    }
  }, [tableId, recordId]);

  const checkCurrentSubscription = async () => {
    try {
      const subscription = await checkSubscription(tableId, recordId);
      setIsSubscribed(!!subscription);
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const subscriptionData = {
        table_id: tableId,
        record_id: recordId,
        notification_types: subscriptionForm.notification_types,
        is_active: subscriptionForm.is_active
      };

      await subscribeToRecord(subscriptionData);
      setShowForm(false);
      checkCurrentSubscription();
      loadSubscriptions();
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (currentSubscription) {
      try {
        await deleteSubscription(currentSubscription.id);
        setIsSubscribed(false);
        setCurrentSubscription(null);
        loadSubscriptions();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  };

  const handleNotificationTypeChange = (type) => {
    setSubscriptionForm(prev => ({
      ...prev,
      notification_types: prev.notification_types.includes(type)
        ? prev.notification_types.filter(t => t !== type)
        : [...prev.notification_types, type]
    }));
  };

  const filteredSubscriptions = recordId 
    ? subscriptions.filter(s => s.record_id === recordId)
    : subscriptions.filter(s => s.table_id === tableId);

  const columns = [
    {
      key: 'table_name',
      header: 'Tabla',
      render: (value) => value || 'N/A'
    },
    {
      key: 'record_id',
      header: 'Registro',
      render: (value) => value ? `#${value}` : 'Toda la tabla'
    },
    {
      key: 'notification_types',
      header: 'Tipos de notificación',
      render: (value) => (
        <div className="notification-types">
          {value?.map(type => (
            <span key={type} className={`type-badge ${type}`}>
              {type}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (value) => (
        <span className={`status-badge ${value ? 'active' : 'inactive'}`}>
          {value ? 'Activa' : 'Inactiva'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Fecha de creación',
      render: (value) => new Date(value).toLocaleDateString('es-ES')
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, subscription) => (
        <Button
          variant="danger"
          size="small"
          onClick={() => deleteSubscription(subscription.id)}
        >
          Eliminar
        </Button>
      )
    }
  ];

  return (
    <div className="record-subscriptions-manager">
      <div className="header">
        <h3>Suscripciones a Cambios</h3>
        <div className="header-actions">
          {recordId && (
            <>
              {isSubscribed ? (
                <Button
                  variant="danger"
                  onClick={handleUnsubscribe}
                  loading={loading}
                >
                  Desuscribirse
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setShowForm(true)}
                >
                  Suscribirse
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isSubscribed && currentSubscription && (
        <div className="current-subscription">
          <h4>Suscripción actual</h4>
          <p>Recibiendo notificaciones para: {currentSubscription.notification_types?.join(', ')}</p>
        </div>
      )}

      <Table
        columns={columns}
        data={filteredSubscriptions}
        loading={loading}
        emptyMessage="No hay suscripciones activas"
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Configurar Suscripción"
        size="medium"
      >
        <div className="subscription-form">
          <h4>Tipos de notificación</h4>
          <p>Selecciona qué tipos de cambios quieres recibir:</p>
          
          <div className="notification-options">
            {['create', 'update', 'delete'].map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={subscriptionForm.notification_types.includes(type)}
                  onChange={() => handleNotificationTypeChange(type)}
                />
                <span className="option-text">
                  {type === 'create' && 'Nuevos registros'}
                  {type === 'update' && 'Actualizaciones'}
                  {type === 'delete' && 'Eliminaciones'}
                </span>
              </label>
            ))}
          </div>

          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubscribe}
              loading={loading}
              disabled={subscriptionForm.notification_types.length === 0}
            >
              Suscribirse
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .record-subscriptions-manager {
          padding: 1rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header h3 {
          margin: 0;
          color: #374151;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .current-subscription {
          padding: 1rem;
          margin-bottom: 1rem;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 0.375rem;
        }

        .current-subscription h4 {
          margin: 0 0 0.5rem 0;
          color: #0c4a6e;
        }

        .current-subscription p {
          margin: 0;
          color: #075985;
        }

        .notification-types {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .type-badge {
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .type-badge.create {
          background: #d1fae5;
          color: #065f46;
        }

        .type-badge.update {
          background: #fef3c7;
          color: #92400e;
        }

        .type-badge.delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        .subscription-form {
          padding: 1rem;
        }

        .subscription-form h4 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }

        .subscription-form p {
          margin: 0 0 1rem 0;
          color: #6b7280;
        }

        .notification-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .option-text {
          font-weight: 500;
          color: #374151;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-actions {
            justify-content: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default RecordSubscriptionsManager;
