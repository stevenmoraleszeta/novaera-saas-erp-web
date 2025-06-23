import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import Button from '../commmon/Button';

function SortableRow({ column, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleClickEdit = (e) => {
    e.stopPropagation();
    if (isDragging) return; // Ignorar click si está arrastrando
    onEdit(column);
  };

  const handleClickDelete = (e) => {
    e.stopPropagation();
    if (isDragging) return;
    onDelete(column.id);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="row"
    >
      <td>{column.name}</td>
      <td>{column.data_type}</td>
      <td>{column.is_required ? 'Sí' : 'No'}</td>
      <td>{column.relation_type || '-'}</td>
      <td>{column.foreign_column_name || '-'}</td>
      <td>
        {Array.isArray(column.validations)
          ? column.validations.join(', ')
          : column.validations || '-'}
      </td>
      <td>
        <Button
          aria-label={`Editar columna ${column.name}`}
          onClick={handleClickEdit}
          variant="outline"
        >
          Editar
        </Button>
        <Button
          aria-label={`Eliminar columna ${column.name}`}
          onClick={handleClickDelete}
          variant="danger"
        >
          Eliminar
        </Button>
      </td>
    </tr>
  );
}

export default function ColumnListTable({
  columns = [],
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  loading = false
}) {
  const [items, setItems] = React.useState(columns.map((col) => col.id));

  React.useEffect(() => {
    setItems(columns.map((col) => col.id));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; // evitar error si se suelta fuera

    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      const reordered = newOrder.map((id) =>
        columns.find((col) => col.id === id)
      );
      onReorder?.(reordered);
    }
  };

  return (
    <div className="column-table-wrapper">
      {loading && <div>Cargando columnas...</div>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <table className="column-table" role="grid">
            <thead>
              <tr role="row">
                <th>Nombre</th>
                <th>Tipo de Dato</th>
                <th>Obligatoria</th>
                <th>Tipo Relación</th>
                <th>Llave Foránea</th>
                <th>Validaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && columns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty">
                    No hay columnas registradas.
                  </td>
                </tr>
              ) : (
                items.map((id) => {
                  const col = columns.find((c) => c.id === id);
                  if (!col) return null;
                  return (
                    <SortableRow
                      key={col.id}
                      column={col}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  );
                })
              )}
              <tr>
                <td colSpan="7" className="add-row">
                  <Button onClick={onAdd} variant="primary">
                    + Agregar columna
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </SortableContext>
      </DndContext>

      <style jsx>{`
        .column-table-wrapper {
          overflow-x: auto;
          margin-top: 1rem;
        }

        .column-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
          background: white;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        th,
        td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        tr:hover {
          background-color: #f3f4f6;
        }

        .empty {
          text-align: center;
          padding: 1.5rem;
          color: #888;
        }

        td:last-child {
          display: flex;
          gap: 0.5rem;
        }

        .add-row {
          text-align: center;
          padding: 1rem;
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}
