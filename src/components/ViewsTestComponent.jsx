import React, { useState, useEffect } from "react";
import { useViews } from "@/hooks/useViews";

export default function ViewsTestComponent({ tableId }) {
  const {
    views,
    columns,
    loadingViews,
    loadingColumns,
    error,
    loadViews,
    loadColumns,
    handleCreateView,
    handleDeleteView,
    handleAddColumnToView,
    handleUpdateView,
    handleUpdateViewColumn,
  } = useViews(tableId);

  const [selectedViewId, setSelectedViewId] = useState(null);
  const [newViewName, setNewViewName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnPosition, setNewColumnPosition] = useState(0);

  useEffect(() => {
    loadViews();
    setSelectedViewId(null);
  }, [tableId, loadViews]);

  useEffect(() => {
    if (selectedViewId) loadColumns(selectedViewId);
    console.log("libertad", columns)
  }, [selectedViewId, loadColumns]);

  const onCreateView = async () => {
    if (!newViewName.trim()) return alert("Nombre de vista requerido");
    try {
      await handleCreateView({
        tableId,
        name: newViewName,
        sortBy: null,
        sortDirection: null,
        columns: [],
      });
      setNewViewName("");
    } catch (e) {
      alert("Error creando vista: " + e.message);
    }
  };

  const onAddColumn = async () => {
    if (!newColumnName.trim()) return alert("Nombre de columna requerido");
    if (!selectedViewId) return alert("Selecciona una vista primero");
    try {
      await handleAddColumnToView({
        view_id: selectedViewId,
        column_id: Number(newColumnPosition),
        visible: true,
      });
      setNewColumnName("");
      setNewColumnPosition(0);
      await loadColumns(selectedViewId);
    } catch (e) {
      alert("Error agregando columna: " + e.message);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>🔍 Probar sistema de Vistas (Tabla ID: {tableId})</h1>

      {error && <p style={{ color: "red" }}>⚠️ Error: {error}</p>}

      {/* Crear nueva vista */}
      <section style={{ marginBottom: 30 }}>
        <h2>➕ Crear Nueva Vista</h2>
        <input
          type="text"
          placeholder="Nombre de la vista"
          value={newViewName}
          onChange={(e) => setNewViewName(e.target.value)}
          style={{ padding: 6, width: "60%" }}
        />
        <button onClick={onCreateView} style={{ marginLeft: 10 }}>Crear</button>
      </section>

      {/* Lista de vistas */}
      <section style={{ marginBottom: 30 }}>
        <h2>📋 Vistas Disponibles</h2>
        {loadingViews ? (
          <p>Cargando vistas...</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {views.map((view) => (
              <li key={view.id} style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: view.id === selectedViewId ? "blue" : "black",
                  }}
                  onClick={() => setSelectedViewId(view.id)}
                >
                  {view.name}
                </span>
                {"  "}
                <button onClick={() => handleDeleteView(view.id)} style={{ marginLeft: 10 }}>
                  Eliminar
                </button>
                <button
                  onClick={() =>
                    handleUpdateView(view.id, {
                      ...view,
                      name: view.name + " (editado)",
                    })
                  }
                  style={{ marginLeft: 10 }}
                >
                  Renombrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Columnas de la vista seleccionada */}
      {selectedViewId && (
        <section>
          <h2>📑 Columnas en Vista ID: {selectedViewId}</h2>

          {/* Agregar columna */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Nombre nueva columna"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              style={{ padding: 6, marginRight: 10 }}
            />
            <input
              type="number"
              placeholder="Posición"
              value={newColumnPosition}
              onChange={(e) => setNewColumnPosition(e.target.value)}
              style={{ padding: 6, width: 80, marginRight: 10 }}
            />
            <button onClick={onAddColumn}>Agregar Columna</button>
          </div>

          {/* Lista de columnas */}
          {loadingColumns ? (
            <p>Cargando columnas...</p>
          ) : (
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {columns.map((col) => (
                <li key={col.id} style={{ marginBottom: 10 }}>
                  {col.name} (Posición: {col.column_id})
                  <button
                    style={{ marginLeft: 10 }}
                    onClick={() =>
                      handleUpdateViewColumn(col.id, {
                        ...col,
                        name: col.name + " (editado)",
                      })
                    }
                  >
                    Renombrar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
