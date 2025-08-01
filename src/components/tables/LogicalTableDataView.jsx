import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation'; 
import useTabStore from '@/stores/tabStore';
import {
  getLogicalTableStructure,
  getLogicalTableRecords,
  deleteLogicalTableRecord,
} from "@/services/logicalTableService";
import Table from "@/components/tables/Table";
import { Button } from "@/components/ui/button";
import {
  Database,
  Edit3,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  Users
} from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";
import DynamicRecordFormDialog from "../records/DynamicRecordFormDialog";
import { notifyAssignedUser } from "@/components/notifications/notifyAssignedUser";
import { useLogicalTables } from "@/hooks/useLogicalTables";
import { useViews } from "@/hooks/useViews";
import SearchBar from "@/components/common/SearchBar";
import FilterDialog from "./dialogs/FilterDialog";
import SortDialog from "./dialogs/SortDialog";
import ColumnForm from "../columns/ColumnForm";
import {
  updateColumn,
} from "@/services/columnsService";
import { useColumns } from "@/hooks/useColumns";
import ConfirmationDialog from "../common/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

import ViewForm from "@/components/ViewForm";
import GenericCRUDTable from "../common/GenericCRUDTable";
import { FileTableCell } from "../common/FileDisplay";
import useUserPermissions from "@/hooks/useUserPermissions";
import ProtectedSection from "../common/ProtectedSection";
import AssignedUsersCell from "./AssignedUsersCell";
import { hasAssignedUsersInTable, getAssignedUsersStatsForTable } from "@/services/recordAssignedUsersService";

import DialogsContainer from "@/components/tables/LogicalTableDataView/DialogsContainer";

import { crearTablaUsuarios, sincronizarTablaUsuarios } from "@/services/usuariosTableManager";
import { sincronizarTablaRoles } from "@/services/rolesTableManager";
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';

import { useViewSorts } from "@/hooks/useViewSorts";

import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableViewTab } from "@/components/tables/DraggableViewTab";
import useUserStore from "../../stores/userStore";


export default function LogicalTableDataView({ 
  tableId, 
  refresh, 
  colName, 
  constFilter, 
  hiddenColumns, 
  forcePermissions, 
  onRowClick, 
  onManageCollaborators, 
  isChildModal = false, 
  preProcessedRecords = null,
  original_record_Id = null
}) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isEditingMode } = useEditModeStore();
  const creatingGeneralViewRef = useRef(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [nameError, setNameError] = useState("");
  const { getTableById, handleUpdatePositionRecord, createOrUpdateTable } = useLogicalTables(null);
  const {
    views,
    columns: viewColumns,
    error: viewsError,
    loadViews,
    loadColumns,
    getColumnsForView,
    handleCreateView,
    handleUpdateView,
    handleDeleteView,
    handleAddColumnToView,
    handleDeleteViewColumn,
    handleUpdatePosition: handleUpdateViewPosition,
    handleUpdateViewColumnPosition,
    loadingViews
  } = useViews(tableId);

  // Hook para verificar permisos del usuario
  const { permissions, loading: permissionsLoading, canCreate, canRead, canUpdate, canDelete } = useUserPermissions(tableId);

  // Usar forcePermissions si están disponibles, sino usar los permisos del usuario
  const effectiveCanCreate = forcePermissions?.can_create ?? canCreate;
  const effectiveCanRead = forcePermissions?.can_read ?? canRead;
  const effectiveCanUpdate = forcePermissions?.can_update ?? canUpdate;
  const effectiveCanDelete = forcePermissions?.can_delete ?? canDelete;

  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState(null);
  const [localRefreshFlag, setLocalRefreshFlag] = useState(false);
  const [tableMeta, setTableMeta] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  useState(false);
  const [showColumnFormDialog, setShowColumnFormDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [filterDraft, setFilterDraft] = useState({
    column: "",
    condition: "",
    value: "",
  });
  const [activeSort, setActiveSort] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  // Assigned users state
  const [hasAssignedUsers, setHasAssignedUsers] = useState(false);
  const [assignedUsersStats, setAssignedUsersStats] = useState(null);

  // Notifications functionality state
  const [hasNotificationColumns, setHasNotificationColumns] = useState(false);

  // View management state
  const [selectedView, setSelectedView] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewFormMode, setViewFormMode] = useState("create");
  const [viewToDelete, setViewToDelete] = useState(null);
  const [showViewDeleteDialog, setShowViewDeleteDialog] = useState(false);

  // Column management state
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnFormMode, setColumnFormMode] = useState("create");
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [showColumnDeleteDialog, setShowColumnDeleteDialog] = useState(false);

  const [showManageViewsDialog, setShowManageViewsDialog] = useState(false);
  const [showEditRecordDialog, setShowEditRecordDialog] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);

  const [showManageColumnsDialog, setShowManageColumnsDialog] = useState(false);

  const [showFilterManager, setShowFilterManager] = useState(false);

  const { handleCreate, handleUpdatePosition, handleDelete } = useColumns(null);

  const [showColumnVisibilityDialog, setShowColumnVisibilityDialog] = useState(false);

  const [orderedViewColumnNames, setOrderedViewColumnNames] = useState([]);

  const [showSortManager, setShowSortManager] = useState(false);


  const [selectOptions, setSelectOptions] = useState({});

  const [formInitialValues, setFormInitialValues] = useState({});

  const { user } = useUserStore();


  const { users } = useUsers();
  const { roles } = useRoles();

  const isUserAdmin = useMemo(() => {
    return roles.some(role =>
      user.roles.includes(role.name) && role.is_admin
    );

  }, [roles, user.roles])


  const {
    sorts: viewSorts,
    loading: loadingSort,
    loadViewSorts
  } = useViewSorts(selectedView?.id);

  constFilter = constFilter || null;

  const filterConditions = [
    { value: "equals", label: "Igual a" },
    { value: "not_equals", label: "Distinto de" },
    { value: "contains", label: "Contiene" },
    { value: "not_contains", label: "No contiene" },
    { value: "greater", label: "Mayor que" },
    { value: "lower", label: "Menor que" },
    { value: "is_null", label: "Es nulo" },
    { value: "is_not_null", label: "No es nulo" },
  ];

  //Ordenamiento de las views tabs
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = views.findIndex((v) => v.id === active.id);
      const newIndex = views.findIndex((v) => v.id === over.id);

      const reorderedViews = arrayMove(views, oldIndex, newIndex);
      const startIndex = Math.min(oldIndex, newIndex);
      const endIndex = Math.max(oldIndex, newIndex);

      const viewsToUpdate = reorderedViews.slice(startIndex, endIndex + 1);

      const updatePromises = viewsToUpdate.map((view, index) => {
        const newPosition = startIndex + index;
        return handleUpdateViewPosition(view.id, newPosition);
      });

      try {
        await Promise.all(updatePromises);
        setLocalRefreshFlag((prev) => !prev);

      } catch (error) {
        console.error("ERROR al actualizar las posiciones de las vistas:", error);
      }
    }
  };

  useEffect(() => {
    if (columns.length > 0) {
      const initialVisibility = {};
      columns.forEach((col) => {
        initialVisibility[col.name] = true; // Default to visible
      });
      setColumnVisibility(initialVisibility);
    }
  }, [columns]);

  useEffect(() => {
    if (
      creatingGeneralViewRef.current ||
      loadingViews ||
      views.length > 0 ||
      !tableId ||
      columns.length === 0
    ) {
      return;
    }

    creatingGeneralViewRef.current = true;
    const createDefaultView = async () => {
      try {
        const newView = await handleCreateView({
          tableId,
          name: "Vista General",
          sort_by: null,
          sort_direction: null,
        });
        const viewId = newView.message.view_id;
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          await handleAddColumnToView({
            view_id: viewId,
            column_id: col.column_id,
            visible: true,
            filter_condition: null,
            filter_value: null,
            position_num: i + 1,
            width_px: 200
          });
        }
        setLocalRefreshFlag((prev) => !prev);
      } catch (err) {
        console.error("Error creando la vista por defecto:", err);
      } finally {
        creatingGeneralViewRef.current = false;
      }
    };
    createDefaultView();
  }, [views, tableId, columns]);

  useEffect(() => {
    const fetchData = async () => {
      if (users.length > 0) {
        await crearTablaUsuarios({
          usuarios: users,
          moduleId: null,
          userId: null,
          createOrUpdateTable,
          handleCreate,
        });
        await sincronizarTablaUsuarios({
          usuarios: users,
        });

      }
    };


    fetchData();
  }, [users]);

  useEffect(() => {
    if (roles.length > 0) {
      sincronizarTablaRoles({
        roles,
        userId: null,
        createOrUpdateTable,
        handleCreate,
      });
    }
  }, [roles]);

  // Función para procesar registros y resolver foreign_record_id a texto descriptivo
  const processRecordsWithForeignText = async (records, columns) => {
    console.log('🐀🔄 Iniciando procesamiento de ', records, columns)
    console.log('🤖🔄 Iniciando procesamiento de registros:', {
      totalRecords: records.length,
      columnsAvailable: columns.length
    });
    
    if (!records || records.length === 0 || !columns || columns.length === 0) {
      console.log('🤖⚠️ No hay registros o columnas para procesar');
      return records;
    }
    
    const processedRecords = [];
    
    for (const record of records) {
      const processedRecord = { ...record };
      
      // Si el registro tiene foreign_record_id, intentar resolver el texto
      if (record.record_data?.foreign_record_id) {
        console.log('🤖🔍 Encontrado registro con foreign_record_id:', {
          recordId: record.id,
          foreignRecordId: record.record_data.foreign_record_id
        });
        
        try {
          // Buscar la columna que define la tabla foránea
          const foreignColumn = columns.find(col => col.foreign_table_id);
          console.log('🤖📋 Columna foránea encontrada:', foreignColumn);
          
          if (foreignColumn && foreignColumn.foreign_table_id) {
            console.log('🤖🌐 Obteniendo registros de tabla foránea ID:', foreignColumn.foreign_table_id);
            
            // Obtener el registro foráneo real
            const foreignRecords = await getLogicalTableRecords(foreignColumn.foreign_table_id);
            const foreignRecord = foreignRecords.find(r => r.id === parseInt(record.record_data.foreign_record_id));
            
            console.log('🤖📝 Registro foráneo encontrado:', foreignRecord);
            
            if (foreignRecord) {
              // Obtener el texto descriptivo del registro foráneo
              const foreignColumnName = foreignColumn.foreign_column_name || 'name';
              const displayText = foreignRecord.record_data?.[foreignColumnName] || 
                                foreignRecord[foreignColumnName] || 
                                foreignRecord.name || 
                                `Registro ${record.record_data.foreign_record_id}`;
              
              console.log('🤖✅ Texto descriptivo generado:', {
                originalId: record.record_data.foreign_record_id,
                displayText: displayText,
                columnName: foreignColumnName
              });
              
              // Reemplazar el foreign_record_id con el texto descriptivo
              processedRecord.record_data = {
                ...processedRecord.record_data,
                foreign_record_id: displayText
              };
            } else {
              console.log('🤖❌ No se encontró el registro foráneo con ID:', record.record_data.foreign_record_id);
            }
          } else {
            console.log('🤖❌ No se encontró columna foránea válida');
          }
        } catch (error) {
          console.error('🤖💥 Error procesando foreign_record_id:', error);
        }
      }
      
      processedRecords.push(processedRecord);
    }
    
    console.log('🤖🎉 Procesamiento completado:', {
      originalCount: records.length,
      processedCount: processedRecords.length,
      recordsWithForeignId: records.filter(r => r.record_data?.foreign_record_id).length
    });
    
    return processedRecords;
  };

  useEffect(() => {

    const fetchData = async () => {
      if (!tableId) {
        setColumns([]);
        setRecords([]);
        setLoading(false);
        return;
      }
      
      // Si tenemos registros pre-procesados, usarlos directamente
      /*
      if (preProcessedRecords) {
        console.log('📦 Usando registros pre-procesados:', preProcessedRecords);
        setRecords(preProcessedRecords);
        
        // Todavía necesitamos cargar las columnas
        try {
          const cols = await getLogicalTableStructure(tableId);
          console.log('📋 Columnas cargadas para registros pre-procesados:', cols);
          setColumns(cols);
          setTotal(preProcessedRecords.length);
        } catch (err) {
          console.error("💥 Error cargando estructura de tabla:", err);
        }
        setLoading(false);
        return;
      } */
      
      loadViews();
      loadViewSorts();
      setLoading(true);
      
      console.log('🚀 Iniciando carga de datos para tabla ID:', tableId);
      
      try {
        const cols = await getLogicalTableStructure(tableId);
        console.log('📋 Columnas cargadas:', cols);
        setColumns(cols);

        const data = await getLogicalTableRecords(tableId, {
          page,
          pageSize,
        });

        const rawRecords = data.records || data;
        console.log('📊 Registros crudos obtenidos:', rawRecords);
        
        // Procesar registros para resolver foreign_record_id a texto descriptivo
        console.log('🔄 Iniciando procesamiento de registros...');
        const processedRecords = await processRecordsWithForeignText(rawRecords, cols);;
        
        
        setRecords(processedRecords);
        setTotal(
          data.total || (data.records ? data.records.length : data.length)
        );

        if (selectedView) {
          handleSelectView(selectedView)
        }

        const recordIdToOpen = searchParams.get('openRecord');
        if (recordIdToOpen) {
          const recordToOpen = processedRecords.find(r => r.id == recordIdToOpen);
          if (recordToOpen) {
            setRecordToEdit(recordToOpen);
            setShowEditRecordDialog(true);
            
            const newPath = window.location.pathname;
            router.replace(newPath, { scroll: false });
          }
        }
      } catch (err) {
        console.error("💥 Error fetching table data:", err);
        setRecords([]);
        setTotal(0);
      } finally {
        setLoading(false);
        useTabStore.getState().clearLoadingTab();
      }
    };
    fetchData();
  }, [tableId, page, pageSize, refresh, localRefreshFlag, preProcessedRecords, searchParams, router]);

  useEffect(() => {
    const fetchMeta = async () => {
      if (!tableId) return;
      try {
        const meta = await getTableById(tableId);
        setTableMeta(meta);
      } catch (err) {
        setTableMeta(null);
      }
    };
    fetchMeta();
  }, [tableId, getTableById]);

  useEffect(() => {
    if (!selectedView && views.length > 0 && columns.length > 0) {
      handleSelectView(views[0]);
    }
  }, [views, columns, selectedView]);

  // Verificar si hay usuarios asignados en la tabla
  useEffect(() => {
    const checkAssignedUsers = async () => {
      if (!tableId) return;

      try {
        console.log('Checking assigned users for table:', tableId);
        const hasUsers = await hasAssignedUsersInTable(tableId);
        console.log('hasUsers result:', hasUsers);
        setHasAssignedUsers(hasUsers);

        if (hasUsers) {
          const stats = await getAssignedUsersStatsForTable(tableId);
          console.log('stats result:', stats);
          setAssignedUsersStats(stats);
        } else {
          setAssignedUsersStats(null);
        }
      } catch (error) {
        console.error('Error checking assigned users:', error);
        setHasAssignedUsers(false);
      }
    };

    checkAssignedUsers();
  }, [tableId, localRefreshFlag]);

  // Verificar si la tabla tiene columnas de fecha (funcionalidad de notificaciones)
  useEffect(() => {
    const hasDateColumns = columns.some(col =>
      ['date', 'datetime', 'timestamp'].includes(col.data_type)
    );
    setHasNotificationColumns(hasDateColumns);
  }, [columns]);

  //Obtener los datos de las tablas para select!
  useEffect(() => {
    const fetchAllOptions = async () => {
      if (columns.length === 0) return;

      const optionsMap = {};
      await Promise.all(
        columns.map(async (col) => {
          if (col.data_type === 'select' && col.foreign_table_id) {
            try {
              const records = await getLogicalTableRecords(col.foreign_table_id);
              optionsMap[col.name] = records.map(r => ({
                value: r.id,
                label: r.record_data[col.foreign_column_name] || `ID: ${r.id}`,
              }));
            } catch (error) {
              console.error(`Error fetching options for column ${col.name}:`, error);
              optionsMap[col.name] = [];
            }
          }
        })
      );
      setSelectOptions(optionsMap);
    };

    fetchAllOptions();
  }, [columns]); // Se ejecuta cada vez que las columnas cambian


  const handleDeleteRecord = async (record) => {
    setDeleteConfirmRecord(record);
  };

  const confirmDeleteRecord = async () => {
    if (!deleteConfirmRecord) return;

    try {
      await deleteLogicalTableRecord(deleteConfirmRecord.id);
      setDeleteConfirmRecord(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const cancelDeleteRecord = () => {
    setDeleteConfirmRecord(null);
  };

  const getDefaultValuesFromFilters = (filters) => {
    const defaults = {};
    for (const filter of filters) {
      const { column, condition, value } = filter;

      // Intentar convertir el valor a número si es posible
      const isNumeric = !isNaN(value) && value !== "";
      const numericValue = isNumeric ? Number(value) : value;

      switch (condition) {
        case "equals":
        case "contains":
          defaults[column] = value ?? null;
          break;

        case "greater":
          defaults[column] = isNumeric ? numericValue + 1 : value;
          break;

        case "lower":
          defaults[column] = isNumeric ? numericValue - 1 : value;
          break;

        case "is_null":
          defaults[column] = null;
          break;

        case "is_not_null":
          if (value === "true" || value === "false") {
            defaults[column] = true; // valor booleano genérico
          } else if (isNumeric) {
            defaults[column] = 0; // valor numérico genérico
          } else {
            defaults[column] = "vacío"; // valor string genérico
          }
          break;

        default:
          break;
      }
    }
    return defaults;
  };




  const tableColumns = useMemo(() => {
    let cols = columns
      .filter((col) => columnVisibility[col.name] !== false &&
        !(hiddenColumns || []).includes(col.name))
      .map((col) => ({
        key: col.name,
        // header: col.name, 
        header: col.name.endsWith('_id') ? col.foreign_column_name : col.name,
        width: col.data_type === "int" ? "80px" : "auto",
        render: (value, row) => {
          const cellValue = row.record_data ? row.record_data[col.name] : row[col.name];
          if (col.data_type === 'select' && selectOptions[col.name]) {
            const option = selectOptions[col.name].find(opt => opt.value === cellValue);
            return <span className="text-sm">{option ? option.label : cellValue || "-"}</span>;
          }
          // Renderizar archivos de manera especial
          if (col.data_type === "file" || col.data_type === "file_array") {
            return (
              <FileTableCell
                value={cellValue}
                multiple={col.data_type === "file_array"}
              />
            );
          }

          // Renderizar usuarios asignados solo si la tabla NO tiene funcionalidad de notificaciones
          if (col.data_type === "assigned_users" && !hasNotificationColumns) {
            return (
              <AssignedUsersCell
                value={cellValue}
                onChange={() => {
                  // El componente AssignedUsersCell maneja la actualización directamente
                  // Solo triggeamos un refresh para actualizar la UI
                  setLocalRefreshFlag(prev => !prev);
                }}
                tableId={tableId}
                recordId={row.id}
                isEditing={isEditingMode}
                className="assigned-users-cell"
              />
            );
          }

          // Si es una columna de usuarios asignados en una tabla con notificaciones, no renderizar nada
          if (col.data_type === "assigned_users" && hasNotificationColumns) {
            return null;
          }

          // Renderizar otros tipos de datos
          return (
            <span className="text-sm">
              {cellValue === null || cellValue === undefined
                ? "-"
                : typeof cellValue === "boolean"
                  ? cellValue ? "Sí" : "No"
                  : cellValue.toString()}
            </span>
          );
        },
      }));

    // Agregar columna de usuarios asignados solo si hay usuarios asignados en la tabla Y la tabla NO tiene funcionalidad de notificaciones
    if (hasAssignedUsers && !hasNotificationColumns && !cols.some(col => col.key === 'assigned_users')) {
      console.log('Adding assigned users column, hasAssignedUsers:', hasAssignedUsers, 'hasNotificationColumns:', hasNotificationColumns);
      cols.push({
        key: 'assigned_users',
        header: 'Usuarios Asignados',
        width: '200px',
        render: (value, row) => {
          return (
            <AssignedUsersCell
              value={[]} // Se cargarán desde el backend
              onChange={() => {
                // Trigger refresh para actualizar la UI
                setLocalRefreshFlag(prev => !prev);
              }}
              tableId={tableId}
              recordId={row.id}
              isEditing={isEditingMode}
              className="assigned-users-cell"
            />
          );
        },
      });
    } else {
      console.log('Not adding assigned users column:', {
        hasAssignedUsers,
        hasNotificationColumns,
        hasAssignedUsersColumn: cols.some(col => col.key === 'assigned_users')
      });
    }

    console.log('Final columns:', cols.map(c => c.key));
    return cols;
  }, [columns, columnVisibility, hiddenColumns, hasAssignedUsers, hasNotificationColumns, tableId, isEditingMode]);

  // Add column management actions to table headers when edit mode changes
  const tableColumnsWithActions = useMemo(() => {

    let sortedCols = [...tableColumns];

    if (orderedViewColumnNames.length > 0) {
      sortedCols = orderedViewColumnNames
        .map((name) => sortedCols.find((col) => col.key === name))
        .filter(Boolean); // eliminar posibles nulos
    }

    return sortedCols.map((col) => {
      if (isEditingMode) {
        return {
          ...col,
          header: (
            <div className="flex items-center justify-between group">
              <span>{col.header}</span>
            </div>
          ),
        };
      }
      return col;
    });
  }, [isEditingMode, tableColumns, orderedViewColumnNames]);



  let processedRecords = [...records];

  if (constFilter) {
    processedRecords = processedRecords.filter((row) => {
      const val = (row.record_data || row)[constFilter.column];
      switch (constFilter.condition) {
        case "equals":
          return String(val) === String(constFilter.value);
        case "not_equals":
          return String(val) !== String(constFilter.value);
        case "contains":
          return String(val || "").toLowerCase().includes(String(constFilter.value).toLowerCase());
        case "not_contains":
          return !String(val || "").toLowerCase().includes(String(constFilter.value).toLowerCase());
        case "greater":
          return Number(val) > Number(constFilter.value);
        case "lower":
          return Number(val) < Number(constFilter.value);
        case "is_null":
          return val == null || val === "";
        case "is_not_null":
          return val != null && val !== "";
        default:
          return true;
      }
    });
  }
  if (activeFilters.length > 0) {
    processedRecords = processedRecords.filter((row) => {
      return activeFilters.every((filter) => {
        const val = (row.record_data || row)[filter.column];
        switch (filter.condition) {
          case "equals":
            return String(val) === String(filter.value);
          case "not_equals":
            return String(val) !== String(filter.value);
          case "contains":
            return String(val || "")
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case "not_contains":
            return !String(val || "")
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case "greater":
            return Number(val) > Number(filter.value);
          case "lower":
            return Number(val) < Number(filter.value);
          case "is_null":
            return val == null || val === "";
          case "is_not_null":
            return val != null && val !== "";
          default:
            return true;
        }
      });
    });
  }
  if (viewSorts.length > 0) {
    processedRecords = [...processedRecords].sort((a, b) => {

      for (const sort of viewSorts) {
        const columnName = columns.find((col) => col.column_id === sort.columnId)?.name;
        if (!columnName) continue;

        const aVal = (a.record_data || a)[columnName];
        const bVal = (b.record_data || b)[columnName];

        // Manejo nulos primero
        if (aVal == null && bVal == null) continue;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Comparación de strings con localeCompare
        if (typeof aVal === "string" && typeof bVal === "string") {
          const cmp = aVal.localeCompare(bVal);
          if (cmp !== 0) return sort.direction === "asc" ? cmp : -cmp;
          continue;
        }

        // Comparación de números (o strings numéricos)
        if (aVal !== bVal) {
          return sort.direction === "asc"
            ? aVal > bVal ? 1 : -1
            : aVal < bVal ? 1 : -1;
        }

        // Si son iguales, pasar al siguiente sort
      }

      return 0;
    });
  }

  const filteredRecords = useMemo(() => {
    if (!searchTerm) {
      return processedRecords;
    }

    return processedRecords.filter((row) => {
      const rowData = row.record_data || row;
      const rowKeys = Object.keys(rowData);
      const searchableText = rowKeys.map(key => {
        const rawValue = rowData[key];
        const column = columns.find(c => c.name === key);

        if (column?.data_type === 'select' && selectOptions[key]) {
          const option = selectOptions[key].find(opt => opt.value === rawValue);
          return option ? option.label : '';
        }

        if (typeof rawValue === 'string' || typeof rawValue === 'number') {
          return rawValue;
        }

        return '';
      }).join(" ");

      const normalizedRowText = searchableText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return normalizedRowText.includes(searchTerm);
    });
  }, [processedRecords, searchTerm, columns, selectOptions]);

  const handleAddFilter = () => {
    if (
      !filterDraft.column ||
      !filterDraft.condition ||
      (filterDraft.condition !== "is_null" &&
        filterDraft.condition !== "is_not_null" &&
        filterDraft.value === "")
    )
      return;
    setActiveFilters((prev) => [...prev, filterDraft]);
    setFilterDraft({ column: "", condition: "", value: "" });
    setShowFilterDialog(false);
  };

  const handleSetSort = () => {
    if (!sortConfig?.column || !sortConfig?.direction) return;

    const matchingCol = columns.find((col) => col.name === sortConfig.column);
    const columnId = matchingCol?.column_id ?? null;

    handleUpdateView(selectedView.id, {
      selectedView,
      name: selectedView.name,
      sort_by: columnId,
      sort_direction: sortConfig.direction,
      position_num: selectedView.position_num,
    });

    setActiveSort({
      column: sortConfig.column || null,
      direction: sortConfig.direction,
    });

    //setLocalRefreshFlag((prev) => !prev);
    setShowSortDialog(false);
  };

  // Column management functions
  const handleCreateColumn = async (columnData) => {
    try {
      //await createColumn(columnData);
      const nuevaColumna = await handleCreate({ ...columnData, table_id: tableId });
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnFormDialog(false);
      setColumnFormMode("create");
      setSelectedColumn(null);
      setLocalRefreshFlag((prev) => !prev);
      for (const vista of views) {
        await handleAddColumnToView({
          view_id: vista.id,
          column_id: nuevaColumna.column.sp_crear_columna,
          visible: true,
          filter_condition: null,
          filter_value: null,
          position_num: null,
          width_px: null
        });
      }


    } catch (err) {
      console.error("Error creating column:", err);
      throw err;
    }
  };

  const handleUpdateColumn = async (columnId, columnData) => {
    try {
      await updateColumn(columnId, columnData);
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnFormDialog(false);
      setColumnFormMode("create");
      setSelectedColumn(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error updating column:", err);
      throw err;
    }
  };

  const handleColumnFormSubmit = async (formData) => {
    if (columnFormMode === "create") {
      await handleCreateColumn(formData);
    } else if (columnFormMode === "edit" && selectedColumn) {
      await handleUpdateColumn(selectedColumn.column_id, formData);
    }
  };

  const handleColumnFormCancel = () => {
    setShowColumnFormDialog(false);
    setSelectedColumn(null);
    setColumnFormMode("create");
  };


  const handleDeleteColumnClick = (columnId) => {
    console.log("handleDeleteColumnClick called with columnId:", columnId);
    const column = columns.find((col) => col.column_id === columnId);
    console.log("Found column:", column);
    if (column) {
      setColumnToDelete(column);
      setShowColumnDeleteDialog(true);
      console.log("Delete dialog should be opening");
    } else {
      console.log("Column not found for ID:", columnId);
    }
  };

  const handleDeleteColumn = async (column) => {
    try {
      await handleDelete(column.column_id);
      // Refresh columns by refetching table structure
      const cols = await getLogicalTableStructure(tableId);
      setColumns(cols);
      setShowColumnDeleteDialog(false);
      setColumnToDelete(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error deleting column:", err);
      throw err;
    }
  };

  const parseValue = (val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    if (!isNaN(val) && val !== "") return Number(val);
    return val;
  };

  // View management functions
  const handleSelectView = async (view) => {
    if (!view) {
      setSelectedView(null);
      setActiveSort(null);
      setActiveFilters([]);
      setColumnVisibility({});
      return;
    }
    setSelectedView(view);

    if (view.sortBy && view.sortDirection) {
      const sortCol = columns.find(col => col.column_id === view.sortBy);
      setActiveSort({
        column: sortCol?.name || null,
        direction: view.sortDirection,
      });
    } else {
      setActiveSort(null)
    }

    try {
      const viewCols = await loadColumns(view.id);

      const visibilityMap = {};
      const filters = [];
      const orderedColumnNames = [];

      // Primero extraer posición (view_columns sin filtro real)
      const positionEntries = viewCols
        .filter(vc => !vc.filter_condition && !vc.filter_value)
        .sort((a, b) => (a.position_num ?? 0) - (b.position_num ?? 0));

      for (const vc of positionEntries) {
        const col = columns.find(c => c.column_id === vc.column_id);
        if (col) orderedColumnNames.push(col.name);
      }

      // Luego aplicar visibilidad y filtros
      for (const vc of viewCols) {
        const col = columns.find((c) => c.column_id === vc.column_id);
        if (!col) continue;

        visibilityMap[col.name] = vc.visible !== false;

        if (vc.filter_condition && (
          vc.filter_condition === "is_null" ||
          vc.filter_condition === "is_not_null" ||
          (vc.filter_value !== null && vc.filter_value !== undefined && vc.filter_value !== "")
        )) {
          console.log(
            vc.filter_value,
            "tipo:",
            typeof vc.filter_value
          );
          filters.push({
            id: vc.id,
            column: col.name,
            condition: vc.filter_condition,
            value: parseValue(vc.filter_value),
          });
        }
      }

      setColumnVisibility(visibilityMap);
      setActiveFilters(filters);
      setOrderedViewColumnNames(orderedColumnNames); // <- nuevo estado
    } catch (err) {
      console.error("Error loading view configuration:", err);
    }
  };


  const handleCreateViewLocal = async (viewData) => {
    try {
      const sortColumn = columns.find(col => col.name === activeSort?.column);

      const newView = await handleCreateView({
        ...viewData,
        tableId,
        sort_by: sortColumn?.column_id || null,
        sort_direction: activeSort?.direction || null,
        position_num: activeFilters.length,
      });

      const viewId = newView.message.view_id;

      // SOLO crear registros puros de posición con visible=true
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        await handleAddColumnToView({
          view_id: viewId,
          column_id: col.column_id,
          visible: true,
          filter_condition: null,
          filter_value: null,
          position_num: i + 1,
          width_px: 200
        });
      }

      setShowViewDialog(false);
      setViewFormMode("create");
      setSelectedView(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error creating view:", err);
      throw err;
    }
  };


  const handleUpdateViewLocal = async (viewId, viewData) => {
    try {

      const sortColumn = columns.find(col => col.name === activeSort?.column);
      // First, update the view with basic info (name, sort settings)
      await handleUpdateView(viewId, {
        ...viewData,
        sortBy: sortColumn?.column_id || null,
        sortDirection: activeSort?.direction || null,
      });
      setShowViewDialog(false);
      setViewFormMode("create");
      setSelectedView(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error updating view:", err);
      throw err;
    }
  };


  const handleDeleteViewLocal = async (view) => {
    try {
      await handleDeleteView(view.id);
      if (selectedView?.id === view.id) {
        setSelectedView(null);
        setActiveSort(null);
        setActiveFilters([]);
        setColumnVisibility({});
      }
      setShowViewDeleteDialog(false);
      setViewToDelete(null);
      setLocalRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error deleting view:", err);
      throw err;
    }
  };

  if (!tableId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Selecciona una tabla</h3>
          <p className="text-sm">
            Elige una tabla lógica del panel izquierdo para ver sus datos
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!columns.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">
            No hay columnas definidas
          </h3>
          <p className="text-sm">Esta tabla no tiene columnas configuradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        {isEditingName ? (
          <>
            <input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-400 focus:outline-none focus:border-black w-[300px]"
              maxLength={50}
              autoFocus
            />
            <button
              onClick={async () => {
                const trimmed = newTableName.trim();
                if (trimmed.length === 0) {
                  setNameError("El nombre no puede estar vacío.");
                  return;
                }
                if (trimmed.length > 50) {
                  setNameError("Máximo 50 caracteres.");
                  return;
                }
                try {
                  await createOrUpdateTable({
                    id: tableMeta.id,
                    name: trimmed,
                  });
                  tableMeta.name = trimmed;
                  setIsEditingName(false);
                  setNameError("");
                } catch (error) {
                  setNameError("Error al guardar el nombre.");
                  console.error(error);
                }
              }}
              className="text-gray-500 hover:text-gray-800"
              title="Guardar nombre"
            >
              <Check className="w-6 h-6" />
            </button>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-gray-900">
              {tableMeta?.name || "Nombre Tabla"}
            </span>
            {isEditingMode && (
              <button
                onClick={() => {
                  setNewTableName(tableMeta?.name || "");
                  setIsEditingName(true);
                }}
                className="text-gray-500 hover:text-gray-800"
                title="Editar nombre"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
      {nameError && (
        <span className="text-red-500 text-sm mt-1">{nameError}</span>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {/* Dynamic view tabs */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              disabled={!isEditingMode}
            >
              <SortableContext
                items={views.map(v => v.id)}
                strategy={horizontalListSortingStrategy}
              >
                {views.map((view) => {
                  return (
                    <DraggableViewTab
                      key={view.id}
                      view={view}
                      isSelected={selectedView?.id === view.id}
                      isEditing={isEditingMode}
                      onClick={handleSelectView}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>

            {isEditingMode && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowManageViewsDialog(true)}
                title="Editar vistas"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}

            {/* Default view (no filters/sort) */}
            {views.length === 0 && (
              <button
                className={`px-4 py-1 font-semibold text-sm border ${!selectedView
                  ? "bg-black text-white shadow border-black"
                  : "bg-gray-200 text-gray-800 border-gray-300"
                  }`}
                onClick={() => handleSelectView(null)}
              >
                Vista General

              </button>
            )}

          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowFilterManager(true)}
          >
            <Filter className="w-5 h-5" />
          </Button>

          {/*          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowSortDialog(true)}
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>} */}


          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            onClick={() => setShowSortManager(true)}
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>

          {isUserAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setShowColumnVisibilityDialog(true)}
            >
              <Eye className="w-5 h-5" />
            </Button>
          )}

          {onManageCollaborators && (
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={onManageCollaborators}
              title="Gestionar colaboradores"
            >
              <Users className="w-5 h-5" />
            </Button>
          )}

          <div className="flex items-center gap-2">
            <SearchBar
              onSearch={setSearchTerm}
              debounceDelay={200}
              placeholder="Buscar..."
            />
          </div>
          {effectiveCanCreate && (
            <Button
              onClick={() => {
                const defaults = getDefaultValuesFromFilters(activeFilters);
                setFormInitialValues(defaults);
                setShowAddRecordDialog(true);
              }}
              size="lg"
              className="w-[150px] h-[36px] rounded-[5px] flex items-center justify-center"
            >
              <span
                className="w-[82px] h-[31px] flex items-center justify-center"
                style={{ fontSize: "20px" }}
              >
                Nuevo
              </span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap mb-2 items-center">
      </div>
      <div
        className="flex-1 overflow-hidden bg-white relative"
        style={{ borderRadius: 0 }}
      >
        {isEditingMode && (
          <div className="absolute top-0 right-0 mt-1 mr-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowManageColumnsDialog(true)}
              title="Gestionar columnas"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {columns.length > 0 && (
          <div className="h-full overflow-auto">
            <GenericCRUDTable
              title={tableMeta?.name || "Tabla"}
              selectedView={selectedView}
              data={filteredRecords}
              useFilter={false}
              columns={tableColumnsWithActions}
              rawColumns={columns}
              isDraggableColumnEnabled={true}
              onRowClick={onRowClick}
              onOrderChange={async (reorderedRecords) => {
                try {
                  for (let i = 0; i < reorderedRecords.length; i++) {
                    await handleUpdatePositionRecord(reorderedRecords[i].id, i + 1);
                  }
                  setLocalRefreshFlag((prev) => !prev); // Refresca una sola vez al final
                } catch (err) {
                  console.error("Error al reordenar registros:", err);
                }
              }}
              onOrderColumnChange={async (reorderedColumnNames) => {
                try {

                  const allViewColumns = await getColumnsForView(selectedView.id);
                  // 1. Obtener todos los view_columns de la vista actual que son solo de orden
                  const viewColumnsForOrder = allViewColumns.filter(
                    (vc) =>
                      vc.filter_condition === null &&
                      vc.filter_value === null
                  );

                  // 2. Hacer el reordenamiento por nombre
                  for (let i = 0; i < reorderedColumnNames.length; i++) {
                    const colName = reorderedColumnNames[i];
                    const col = columns.find((c) => c.name === colName);
                    if (!col) continue;

                    const viewCol = viewColumnsForOrder.find(
                      (vc) => vc.column_id === col.column_id
                    );

                    if (viewCol) {
                      await handleUpdateViewColumnPosition(viewCol.id, i + 1);
                    }
                  }

                  setLocalRefreshFlag((prev) => !prev); // Refrescar después de aplicar todos los cambios
                } catch (err) {
                  console.error("Error al reordenar columnas:", err);
                }
              }}

              getRowKey={(row) => row.id}
              onCreate={effectiveCanCreate ? () => setShowAddRecordDialog(true) : undefined}
              onUpdate={effectiveCanUpdate ? (id, updatedData) => {
                setRecordToEdit({ ...updatedData, id });
                setShowEditRecordDialog(true);
              } : undefined}
              onDelete={effectiveCanDelete ? handleDeleteRecord : undefined}
              rowIdKey="id"
              permissions={{
                canCreate: effectiveCanCreate,
                canRead: effectiveCanRead,
                canUpdate: effectiveCanUpdate,
                canDelete: effectiveCanDelete
              }}
              renderForm={({ mode, item, open, onClose, onSubmit }) => (
                <DynamicRecordFormDialog
                  open={open}
                  isChildModal={isChildModal}
                  original_record_Id = {original_record_Id}
                  colName={colName}
                  foreignForm={!!(constFilter && hiddenColumns)}
                  onOpenChange={(val) => {
                    if (!val) onClose();
                  }}
                  onCancel={onClose}
                  tableId={tableId}
                  record={item}
                  mode={mode}
                  onDelete={effectiveCanDelete ? handleDeleteRecord : undefined}
                  onSubmitSuccess={async (createdOrUpdatedRecord) => {
                    if (mode === "create") {
                      const userColumn = columns.find((col) => col.data_type === "user");
                      const userId = userColumn
                        ? createdOrUpdatedRecord.message.record.record_data?.[userColumn.name]
                        : null;

                      if (userId) {
                        try {
                          const table = await getTableById(tableId);
                          const tableName = table.name;

                          await notifyAssignedUser({
                            userId,
                            action: "created",
                            tableName,
                            recordId: createdOrUpdatedRecord?.id,
                          });
                        } catch (err) {
                          console.error("Error notificando usuario asignado:", err);
                        }
                      }
                    }

                    onSubmit(createdOrUpdatedRecord);
                    setLocalRefreshFlag((prev) => !prev);
                  }}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DialogsContainer
        showFilterDialog={showFilterDialog}
        setShowFilterDialog={setShowFilterDialog}
        showAddRecordDialog={showAddRecordDialog}
        setShowAddRecordDialog={setShowAddRecordDialog}
        deleteConfirmRecord={deleteConfirmRecord}
        cancelDeleteRecord={cancelDeleteRecord}
        confirmDeleteRecord={confirmDeleteRecord}
        tableId={tableId}
        colName={colName}
        constFilter={constFilter}
        hiddenColumns={hiddenColumns}
        getTableById={getTableById}
        notifyAssignedUser={notifyAssignedUser}
        setLocalRefreshFlag={setLocalRefreshFlag}
        columns={columns}
        setDeleteConfirmRecord={setDeleteConfirmRecord}
        showColumnFormDialog={showColumnFormDialog}
        setShowColumnFormDialog={setShowColumnFormDialog}
        columnFormMode={columnFormMode}
        selectedColumn={selectedColumn}
        handleColumnFormSubmit={handleColumnFormSubmit}
        handleColumnFormCancel={handleColumnFormCancel}
        handleDeleteColumnClick={handleDeleteColumnClick}
        showViewDeleteDialog={showViewDeleteDialog}
        setShowViewDeleteDialog={setShowViewDeleteDialog}
        viewToDelete={viewToDelete}
        setViewToDelete={setViewToDelete}
        handleDeleteViewLocal={handleDeleteViewLocal}
        showColumnDeleteDialog={showColumnDeleteDialog}
        setShowColumnDeleteDialog={setShowColumnDeleteDialog}
        columnToDelete={columnToDelete}
        handleDeleteColumn={handleDeleteColumn}
        showViewDialog={showViewDialog}
        setShowViewDialog={setShowViewDialog}
        selectedView={selectedView}
        viewFormMode={viewFormMode}
        setViewFormMode={setViewFormMode}
        handleCreateViewLocal={handleCreateViewLocal}
        handleUpdateViewLocal={handleUpdateViewLocal}
        activeSort={activeSort}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        setActiveSort={setActiveSort}
        showManageColumnsDialog={showManageColumnsDialog}
        setShowManageColumnsDialog={setShowManageColumnsDialog}
        handleUpdatePosition={handleUpdatePosition}
        handleCreateColumn={handleCreateColumn}
        handleUpdateColumn={handleUpdateColumn}
        showManageViewsDialog={showManageViewsDialog}
        setShowManageViewsDialog={setShowManageViewsDialog}
        showFilterManager={showFilterManager}
        setShowFilterManager={setShowFilterManager}
        filterConditions={filterConditions}
        filterDraft={filterDraft}
        setFilterDraft={setFilterDraft}
        handleAddFilter={handleAddFilter}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        showColumnVisibilityDialog={showColumnVisibilityDialog}
        setShowColumnVisibilityDialog={setShowColumnVisibilityDialog}
        showSortDialog={showSortDialog}
        setShowSortDialog={setShowSortDialog}
        setSortConfig={setSortConfig}
        sortConfig={sortConfig}
        handleSetSort={handleSetSort}
        showSortManager={showSortManager}
        setShowSortManager={setShowSortManager}
        getDefaultValuesFromFilters={getDefaultValuesFromFilters}
        formInitialValues={formInitialValues}
        setFormInitialValues={setFormInitialValues}
        isChildModal={isChildModal}
        original_record_Id = {original_record_Id}
      />
    </div>
  );
}
