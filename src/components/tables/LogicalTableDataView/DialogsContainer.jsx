"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FilterDialog from "@/components/tables/dialogs/FilterDialog";
import DynamicRecordFormDialog from "@/components/records/DynamicRecordFormDialog";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import ColumnForm from "@/components/columns/ColumnForm";
import GenericCRUDTable from "@/components/common/GenericCRUDTable";
import ViewForm from "@/components/ViewForm";
import { useColumns } from "@/hooks/useColumns";
import SortDialog from "../dialogs/SortDialog";
import { useViews } from "@/hooks/useViews";


export default function DialogsContainer(props) {

const { handleUpdatePosition, handleDelete } = useColumns(null);

  const {
    showFilterDialog,
    setShowFilterDialog,
    showAddRecordDialog,
    setShowAddRecordDialog,
    deleteConfirmRecord,
    cancelDeleteRecord,
    confirmDeleteRecord,
    tableId,
    colName,
    constFilter,
    hiddenColumns,
    getTableById,
    notifyAssignedUser,
    setLocalRefreshFlag,
    columns,
    setDeleteConfirmRecord,
    showColumnFormDialog,
    setShowColumnFormDialog,
    columnFormMode,
    selectedColumn,
    handleColumnFormSubmit,
    handleColumnFormCancel,
    handleDeleteColumnClick,
    showViewDeleteDialog,
    setShowViewDeleteDialog,
    viewToDelete,
    setViewToDelete,
    handleDeleteViewLocal,
    showColumnDeleteDialog,
    setShowColumnDeleteDialog,
    columnToDelete,
    handleDeleteColumn,
    showViewDialog,
    setShowViewDialog,
    selectedView,
    viewFormMode,
    setViewFormMode,
    handleCreateViewLocal,
    handleUpdateViewLocal,
    activeSort,
    activeFilters,
    setActiveFilters,
    setActiveSort,
    showManageColumnsDialog,
    setShowManageColumnsDialog,
    handleCreateColumn,
    handleUpdateColumn,
    showManageViewsDialog,
    setShowManageViewsDialog,
    showFilterManager,
    setShowFilterManager,
    filterConditions,
    filterDraft,
    setFilterDraft,
    handleAddFilter,
    columnVisibility,
    setColumnVisibility,
    showColumnVisibilityDialog,
    setShowColumnVisibilityDialog,
    setShowSortDialog,
    showSortDialog,
    setSortConfig,
    sortConfig,
    handleSetSort
  } = props;

    const {
    views,
    handleAddColumnToView,
    handleDeleteViewColumn,
    handleUpdateViewColumn,
    getColumnsForView,
    handleUpdatePosition: handleUpdateViewPosition,
  } = useViews(tableId);

  return (
    <>
      {/* Aquí se insertan uno a uno los dialogs con las props pasadas */}
      {/* Por claridad, se recomienda dividir internamente en componentes si crece más */}

        <SortDialog
            open={showSortDialog}
            onOpenChange={setShowSortDialog}
            columns={columns}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            onSetSort={handleSetSort}
        />

      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        columns={columns}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        filterConditions={filterConditions}
        filterDraft={filterDraft}
        setFilterDraft={setFilterDraft}
        onAddFilter={handleAddFilter}
        showFilters={false}
      />

      <DynamicRecordFormDialog
        open={showAddRecordDialog}
        onOpenChange={setShowAddRecordDialog}
        tableId={tableId}
        colName={colName}
        foreignForm={!!(constFilter && hiddenColumns)}
        onSubmitSuccess={async (createdRecord) => {
          const userColumn = columns.find((col) => col.data_type === "user");
          const userId = userColumn
            ? createdRecord.message.record.record_data?.[userColumn.name]
            : null;

          if (userId) {
            try {
              const table = await getTableById(tableId);
              const tableName = table.name;

              await notifyAssignedUser({
                userId,
                action: "created",
                tableName,
                recordId: createdRecord?.id,
              });
            } catch (err) {
              console.error("Error notificando usuario asignado:", err);
            }
          }

          setShowAddRecordDialog(false);
          setLocalRefreshFlag((prev) => !prev);
        }}
      />

      <ConfirmationDialog
        open={!!deleteConfirmRecord}
        onClose={() => setDeleteConfirmRecord(null)}
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer. Se eliminará permanentemente el registro."
        actions={[
          { label: "Cancelar", onClick: cancelDeleteRecord, variant: "default" },
          { label: "Eliminar", onClick: confirmDeleteRecord, variant: "outline" },
        ]}
      />

      <ColumnForm
        open={showColumnFormDialog}
        onOpenChange={setShowColumnFormDialog}
        mode={columnFormMode}
        initialData={selectedColumn}
        onSubmit={handleColumnFormSubmit}
        onCancel={handleColumnFormCancel}
        onDelete={handleDeleteColumnClick}
        loading={false}
        error={null}
        tableId={tableId}
        lastPosition={columns.length}
      />

      <ConfirmationDialog
        open={showViewDeleteDialog}
        onClose={() => {
          setShowViewDeleteDialog(false);
          setViewToDelete(null);
        }}
        title={`¿Desea eliminar la vista "${viewToDelete?.name || ""}"?`}
        message={"Esta acción no se puede deshacer."}
        actions={[
          {
            label: "Cancelar",
            onClick: () => {
              setShowViewDeleteDialog(false);
              setViewToDelete(null);
            },
            variant: "default",
          },
          {
            label: "Eliminar",
            onClick: () => handleDeleteViewLocal(viewToDelete),
            variant: "outline",
          },
        ]}
      />

      <ConfirmationDialog
        open={showColumnDeleteDialog}
        onClose={() => {
          setShowColumnDeleteDialog(false);
          setColumnToDelete(null);
        }}
        title={`¿Desea eliminar la columna "${columnToDelete?.name || ""}"?`}
        message={"Algunos cambios podrían ser irreparables."}
        actions={[
          {
            label: "Cancelar",
            onClick: () => {
              setShowColumnDeleteDialog(false);
              setColumnToDelete(null);
            },
            variant: "default",
          },
          {
            label: "Eliminar",
            onClick: () => handleDeleteColumn(columnToDelete),
            variant: "outline",
          },
        ]}
      />

      {/* View Form Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
              <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {viewFormMode === "create" ? "Nueva Vista" : "Editar Vista"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Nombre de la Vista</Label>
                  <Input
                    type="text"
                    placeholder="Ingrese el nombre de la vista"
                    defaultValue={selectedView?.name || ""}
                    id="view-name-input"
                  />
                  <div className="text-sm text-gray-600">
                    <p>Esta vista guardará:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {activeSort?.column && (
                        <li>
                          Ordenamiento: {activeSort.column} ({activeSort.direction})
                        </li>
                      )}
                      {activeFilters.length > 0 && (
                        <li>{activeFilters.length} filtro(s) aplicado(s)</li>
                      )}
                      <li>Configuración de columnas visibles</li>
                    </ul>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowViewDialog(false);
                        setSelectedView(null);
                        setViewFormMode("create");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        const nameInput = document.getElementById("view-name-input");
                        const viewName = nameInput?.value?.trim();
      
                        if (!viewName) {
                          alert("Por favor ingrese un nombre para la vista");
                          return;
                        }
      
                        if (viewFormMode === "create") {
                          handleCreateViewLocal({ name: viewName });
                        } else {
                          handleUpdateViewLocal(selectedView.id, { name: viewName });
                        }
                      }}
                    >
                      {viewFormMode === "create" ? "Crear" : "Actualizar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
      
            <Dialog open={showManageColumnsDialog} onOpenChange={setShowManageColumnsDialog}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto"> 
                <DialogHeader>
                  <DialogTitle>Columnas</DialogTitle>
                </DialogHeader>
      
                  <GenericCRUDTable
                    title="Columnas"
                    selectedView = {selectedView}
                    data={columns}
                    hiddenColumns = {hiddenColumns}
                    columns={[
                      { column_id: "name", name: "name",  key: "name", header: "Nombre"},
                      { column_id: "data_type", name: "data_type",  key: "data_type", header: "Tipo"},
                      {
                        column_id: "required",
                        name: "required",
                        key: "required",
                        header: "Requerido",
                        render: (val) => (val ? "Sí" : "No"),
                      },
                    ]}
                    onOrderChange={async (reorderedCols) => {
                      try {
                        for (let i = 0; i < reorderedCols.length; i++) {
                          await handleUpdatePosition(reorderedCols[i].column_id, i + 1);
                        }
                        //setLocalRefreshFlag((prev) => !prev); // Refresca una sola vez al final
                      } catch (err) {
                        console.error("Error al reordenar columnas:", err);
                      }
                    }}
                    getRowKey={(col) => col.column_id}
                    onCreate={handleCreateColumn}
                    onUpdate={handleUpdateColumn}
                    rowIdKey={"column_id"}
                    onDelete={handleDeleteColumn}
                    renderForm={({ mode, item, open, onClose, onSubmit }) => (
                      <ColumnForm
                        open={open}
                        onOpenChange={(val) => {
                          if (!val) onClose();
                        }}
                        mode={mode}
                        initialData={item}
                        onSubmit={onSubmit}
                        onCancel={onClose}
                        onDelete={(colId) => {
                          handleDeleteColumnClick(colId);
                          onClose();
                        }}
                        loading={false}
                        error={null}
                        tableId={tableId}
                        lastPosition={columns.length}
                      />
                    )}
                  />
      
              </DialogContent>
            </Dialog>
            {/* View Delete Confirmation Dialog */}
            <Dialog open={showManageViewsDialog} onOpenChange={setShowManageViewsDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Vistas</DialogTitle>
                    </DialogHeader>
                  <GenericCRUDTable
                    title="Vistas Personalizadas"
                    selectedView = {selectedView}
                    data={views}
                    columns={[
                      {
                        key: "name",
                        column_id: "name",
                        header: "Nombre",
                        name: "name",
                        render: (val) => <span>{val}</span>,
                      },
                      {
                        key: "sort_by",
                        column_id: "sort_by",
                        header: "Orden",
                        name: "sort_by",
                        render: (val) =>
                          columns.find((c) => c.column_id === val)?.name || "-",
                      },
                    ]}
      
                    onOrderChange={async (reorderedViews) => {
                      try {
                        for (let i = 0; i < reorderedViews.length; i++) {
                          await handleUpdateViewPosition(reorderedViews[i].id, i + 1);
                        }
                        setLocalRefreshFlag((prev) => !prev); // Refresca una sola vez al final
                      } catch (err) {
                        console.error("Error al reordenar vistas:", err);
                      }
                    }}
                    getRowKey={(view) => view.id}
                    onCreate={handleCreateViewLocal}
                    onUpdate={handleUpdateViewLocal}
                    onDelete={handleDeleteViewLocal}
                    renderForm={({ mode, item, open, onClose, onSubmit }) => (
                    <ViewForm
                        open={open}
                        mode={mode}
                        initialData={item}
                        activeSort={activeSort}
                        activeFilters={activeFilters}
                        onClose={onClose}
                        onSubmit={onSubmit}
                        onDelete={(viewId) => {
                          setViewToDelete(views.find((v) => v.id === viewId));
                          setShowViewDeleteDialog(true);
                          onClose();
                        }}
                      />
                    )}
                  />
      
              <DialogFooter className="flex justify-end gap-2 pt-4">
                  {((activeSort && activeSort.column) ||
                    (activeFilters && activeFilters.length > 0)) && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2"
                        onClick={() => {
                          setActiveFilters([]);
                          setActiveSort(null);
                        }}
                      >
                        Limpiar
                      </Button>
                    </>
                  )}
      
              </DialogFooter>
      
                </DialogContent>
              </Dialog>
      
              <Dialog open={showFilterManager} onOpenChange={setShowFilterManager}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Filtros aplicados</DialogTitle>
                  </DialogHeader>
      
                  <GenericCRUDTable
                    title="Filtros"
                    selectedView = {selectedView}
                    data={activeFilters}
                    columns={[
                      {
                        key: "column",
                        column_id: "column",
                        header: "Columna",
                        name: "column",
                        render: (val) => columns.find((c) => c.name === val)?.name || val,
                      },
                      {
                        key: "condition",
                        column_id: "condition",
                        header: "Condición",
                        name: "condition",
                        render: (val) =>
                          filterConditions.find((cond) => cond.value === val)?.label || val,
                      },
                      {
                        key: "value",
                        column_id: "value",
                        header: "Valor",
                        name: "value",
                      },
                    ]}
                    getRowKey={(row) => row.id}
                    rowIdKey="id"
                    onCreate={(newFilter) => {
                      setActiveFilters((prev) => [...prev, newFilter]);
                      const matchingColumn = columns.find(
                        (col) => col.name === newFilter.column && col.table_id === tableId
                      );
                      const columnId = matchingColumn?.column_id || null;
                      const visible = columnVisibility[matchingColumn?.name] || null;
                      
                      let filterToAdd = {
                        view_id: selectedView.id,
                        column_id: columnId,
                        visible: visible,
                        filter_condition: newFilter?.condition || null,
                        filter_value: newFilter?.value || null,
                      }; 
                      handleAddColumnToView(filterToAdd);
                    }}
                    onUpdate={(_, updatedFilter) => {
      
                      setActiveFilters((prev) =>
                        prev.map((f) => (f.id === updatedFilter.id ? updatedFilter : f))
                      );
                      const matchingColumn = columns.find(
                        (col) => col.name === updatedFilter.column && col.table_id === tableId
                      );
                      const columnId = matchingColumn?.column_id || null;
                      const visible = columnVisibility[matchingColumn?.name] || null;
                      let filterEdited = {
                        view_id: selectedView.id,
                        column_id: columnId,
                        visible: visible,
                        filter_condition: updatedFilter?.condition || null,
                        filter_value: updatedFilter?.value || null,
                      };
                      handleUpdateViewColumn(_, filterEdited);
                    }}
      
                    onDelete={(id) => {
                      setActiveFilters((prev) => prev.filter((f) => f.id !== id));
                      handleDeleteViewColumn(id, selectedView.id);
                    }}
                    renderForm={({ mode, item, open, onClose, onSubmit, onDelete  }) => {
                      const [formData, setFormData] = useState({
                        id: "",
                        column: columns[0]?.name,
                        condition: "equals",
                        value: "",
                        onDelete: handleDelete,
                      });
                      useEffect(() => {
                        if (open && mode === "create") {
                          setFormData({
                            id: crypto.randomUUID(),
                            column: columns[0]?.name,
                            condition: "equals",
                            value: "",
                          });
                        } else if (mode === "edit" && item) {
                          setFormData(item);
                        }
                      }, [open, mode, item, columns]);
                      return (
                        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {mode === "create" ? "Nuevo Filtro" : "Editar Filtro"}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Label>Columna</Label>
                              <select
                                value={formData.column}
                                onChange={(e) =>
                                  setFormData({ ...formData, column: e.target.value })
                                }
                                className="w-full border px-2 py-1"
                              >
                                {columns.map((col) => (
                                  <option key={col.name} value={col.name}>
                                    {col.name}
                                  </option>
                                ))}
                              </select>
      
                              <Label>Condición</Label>
                              <select
                                value={formData.condition}
                                onChange={(e) =>
                                  setFormData({ ...formData, condition: e.target.value })
                                }
                                className="w-full border px-2 py-1"
                              >
                                {filterConditions.map((cond) => (
                                  <option key={cond.value} value={cond.value}>
                                    {cond.label}
                                  </option>
                                ))}
                              </select>
      
                              {!["is_null", "is_not_null"].includes(formData.condition) && (
                                <>
                                  <Label>Valor</Label>
                                  <Input
                                    value={formData.value}
                                    onChange={(e) =>
                                      setFormData({ ...formData, value: e.target.value })
                                    }
                                  />
                                </>
                              )}
                            </div>
                            <DialogFooter className="pt-4">
                              <Button onClick={() => onSubmit(formData)}>
                                {mode === "create" ? "Agregar" : "Guardar"}
                              </Button>
                              {mode === "edit" && typeof onDelete === "function" && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    onClose();
                                    onDelete(item.id);
                                  }}
                                >
                                  Eliminar
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      );
                    }}
                  />
                </DialogContent>
              </Dialog>
      
              <Dialog open={showColumnVisibilityDialog} onOpenChange={setShowColumnVisibilityDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Columnas visibles</DialogTitle>
                  </DialogHeader>
      
                  <GenericCRUDTable
                    title="Columnas visibles"
                    selectedView = {selectedView}
                    data={columns.map((col) => ({
                      ...col,
                      visible: columnVisibility[col.name] !== false, // default true
                    }))}
                    columns={[
                      {
                        key: "name",
                        column_id: "name",
                        header: "Columna",
                        name: "name",
                      },
                      {
                        key: "visible",
                        column_id: "visible",
                        header: "¿Visible?",
                        name: "visible",
                        render: (val) => (val ? "Sí" : "No"),
                      },
                    ]}
                    getRowKey={(col) => col.name}
                    rowIdKey="name"
                    onUpdate={(_, updatedCol) => {
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [updatedCol.name]: updatedCol.visible,
                      }));
      
                      // Actualiza en la vista si hay una seleccionada
                        if (selectedView) {
                        const matchingColumn = columns.find((c) => c.name === updatedCol.name);
                        const columnId = matchingColumn?.column_id;

                        // Lógica async en una IIFE o dentro de un useEffect/callback async
                        (async () => {
                            const viewColumns = await getColumnsForView(selectedView.id);
                            const matchingViewColumn = viewColumns.find(
                            (vc) =>
                                vc.column_id === columnId &&
                                vc.filter_condition === null &&
                                vc.filter_value === null
                            );

                            if (matchingViewColumn) {
                            await handleUpdateViewColumn(matchingViewColumn.id, {
                                visible: updatedCol.visible,
                                view_id: selectedView.id,
                                position_num: matchingViewColumn.position_num
                            });
                            } else {
                                let filterToAdd = {
                                    view_id: selectedView.id,
                                    column_id: columnId,
                                    visible: updatedCol.visible,
                                    filter_condition:  null,
                                    filter_value: null,
                                };
                              handleAddColumnToView(filterToAdd);
                            }
                        })();
                        }
                    }}
                    renderForm={({ mode, item, open, onClose, onSubmit }) => {
                      const [formData, setFormData] = useState({
                        name: item?.name || "",
                        visible: item?.visible ?? true,
                      });
      
                      useEffect(() => {
                        if (open && item) {
                          setFormData({
                            name: item.name,
                            visible: item.visible,
                          });
                        }
                      }, [open, item]);
      
                      return (
                        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Visibilidad de columna</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Label>Columna</Label>
                              <Input value={formData.name} disabled />
                              <Label>¿Visible?</Label>
                              <select
                                value={formData.visible ? "true" : "false"}
                                onChange={(e) =>
                                  setFormData({ ...formData, visible: e.target.value === "true" })
                                }
                                className="w-full border px-2 py-1"
                              >
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                              </select>
                            </div>
                            <DialogFooter className="pt-4">
                              <Button onClick={() => onSubmit(formData)}>Guardar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      );
                    }}
                  />
                </DialogContent>
              </Dialog>

      {/* Agrega aquí los otros dialogs: ViewForm, ManageColumns, ManageViews, FilterManager, ColumnVisibility */}
    </>
  );
}