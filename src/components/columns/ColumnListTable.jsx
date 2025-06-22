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
import Button from '../Button';

  function SortableRow({ column, onEdit, onDelete }) {
    console.log(column, "  kolumnaa");
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: column.id
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
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
      <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <td>{column.name}</td>
        <td>{column.data_type}</td>
        <td>{column.is_required ? 'Sí' : 'No'}</td>
        <td>{column.relation_type || '-'}</td>
        <td>{column.foreign_column_name || '-'}</td>
        <td>{Array.isArray(column.validations) ? column.validations.join(', ') : column.validations || '-'}</td>
        <td>
          <Button onClick={handleClickEdit} variant="outline">Editar</Button>
          <Button onClick={handleClickDelete} variant="danger">Eliminar</Button>
        </td>
      </tr>
    );
  }


export default function ColumnListTable({ columns = [], onEdit, onDelete, onAdd, onReorder, loading = false }) {
  const [items, setItems] = React.useState(columns.map(col => col.id));

  React.useEffect(() => {
    setItems(columns.map(col => col.id));
  }, [columns]);

      const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 5, // Mínimo 5px de movimiento para activar drag
          },
        }),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
      );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);

      // Notificar al padre el nuevo orden
      const reordered = newOrder.map((id) =>
        columns.find((col) => col.id === id)
      );
      onReorder?.(reordered);
    }
  };

  return (
    <div className="column-table-wrapper">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <table className="column-table">
            <thead>
              <tr>
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
              {columns.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="empty">No hay columnas registradas.</td>
                </tr>
              ) : (
                  items.map((id) => {
                    const col = columns.find((c) => c.id === id);
                    if (!col) return null;  // Ignorar ids que ya no existen
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
                  <Button onClick={onAdd} variant="primary">+ Agregar columna</Button>
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

        th, td {
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
