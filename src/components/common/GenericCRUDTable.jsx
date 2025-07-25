"use client";

import { useState, useMemo, useEffect } from "react";
import Table from "@/components/tables/Table";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import SearchBar from "@/components/common/SearchBar";
import FilterDialog from "@/components/tables/dialogs/FilterDialog";
import SortDialog from "@/components/tables/dialogs/SortDialog";
import useEditModeStore from "@/stores/editModeStore";
import { useViews } from "@/hooks/useViews";

export default function GenericCRUDTable({
  title,
  selectedView,
  data = [],
  columns = [],
  getRowKey = (row) => row.id,
  rowIdKey = "id",
  onCreate,
  onUpdate,
  onDelete,
  renderForm,
  useFilter = true,
  onOrderChange,
  onOrderColumnChange,
  rawColumns,
  isDraggableColumnEnabled
}) {

  const {
    views,
    handleAddColumnToView,
    handleUpdateViewColumn,
    getColumnsForView,
  } = useViews();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const { isEditingMode } = useEditModeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [activeSort, setActiveSort] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const [columnWidths, setColumnWidths] = useState({});


  const [filterDraft, setFilterDraft] = useState({
    column: "",
    condition: "",
    value: "",
  });

  const handleNew = () => {
    setFormMode("create");
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setFormMode("edit");
    setSelectedItem(item);
    setFormOpen(true);
  };

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
    setActiveSort(sortConfig);
    setShowSortDialog(false);
  };

  const filteredData = useMemo(() => {

    const implicitFilters = [
      { column: "name", condition: "not_contains", value: "original_record_id" },
    ];

    const allFilters = [...implicitFilters, ...activeFilters];
    let result = [...data];

    for (const filter of allFilters) {
      result = result.filter((row) => {
        const value = row[filter.column];
        switch (filter.condition) {
          case "equals":
            return String(value) === String(filter.value);
          case "not_equals":
            return String(value) !== String(filter.value);
          case "contains":
            return String(value || "")
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case "not_contains":
            return !String(value || "")
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case "greater":
            return Number(value) > Number(filter.value);
          case "lower":
            return Number(value) < Number(filter.value);
          case "is_null":
            return value == null || value === "";
          case "is_not_null":
            return value != null && value !== "";
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      result = result.filter((row) => {
      const searchableValues = Object.values(row).filter(value =>
        typeof value === 'string' || typeof value === 'number'
      );
      const rowAsText = searchableValues.join(" ");
      const normalizedRowText = rowAsText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    
      return normalizedRowText.includes(searchTerm);
      });
    }

    if (activeSort && activeSort.column) {
      result.sort((a, b) => {
        const aVal = a[activeSort.column];
        const bVal = b[activeSort.column];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal === bVal) return 0;
        return activeSort.direction === "asc"
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
            ? 1
            : -1;
      });
    }

    return result;
  }, [data, activeFilters, searchTerm, activeSort]);

  useEffect(() => {
    if (!selectedView || !Array.isArray(rawColumns) || rawColumns.length === 0) {
      // No hay columnas crudas, no se puede mapear el ancho, pero tampoco hay problema
      return;
    }

    const loadViewColumns = async () => {
      const viewColumns = await getColumnsForView(selectedView.id);

      const widthMap = {};
      for (const vc of viewColumns) {
        const rawCol = rawColumns.find((col) => col.column_id === vc.column_id);
        if (rawCol && vc.width_px) {
          widthMap[rawCol.name] = `${vc.width_px}px`;
        }
      }

      setColumnWidths(widthMap);
    };

    loadViewColumns();
  }, [selectedView, rawColumns, getColumnsForView]);


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-6" />
        {useFilter && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setShowFilterDialog(true)}
            >
              <Filter className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setShowSortDialog(true)}
            >
              <ArrowUpDown className="w-5 h-5" />
            </Button>
            <SearchBar
              onSearch={handleSearch}
              debounceDelay={200}
              placeholder="Buscar..."
            />
            <Button
              onClick={handleNew}
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
          </div>
        )}
      </div>

      {useFilter && (
        <div className="flex flex-wrap mb-2 items-center">
          {activeSort?.column && (
            <span className="inline-flex items-center text-sm font-medium mr-4">
              {columns.find((c) => c.name === activeSort.column)?.header ||
                activeSort.column}
              {activeSort.direction === "asc" ? (
                <ArrowUp className="ml-1 w-4 h-4 inline" />
              ) : (
                <ArrowDown className="ml-1 w-4 h-4 inline" />
              )}
            </span>
          )}
          {activeSort?.column && activeFilters.length > 0 && (
            <div className="w-px h-4 bg-black mx-2" />
          )}
          {activeFilters.map((f, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-sm font-medium mr-4"
            >
              {columns.find((c) => c.name === f.column)?.header || f.column}{" "}
              {
                filterConditions.find((cond) => cond.value === f.condition)
                  ?.label
              }{" "}
              {f.value &&
                f.condition !== "is_null" &&
                f.condition !== "is_not_null"
                ? `"${f.value}"`
                : ""}
            </span>
          ))}
        </div>
      )}
      <div
        className="overflow-x-auto overflow-y-auto w-full"
        style={{
          maxWidth: "100%",
          maxHeight: "calc(90vh - 250px)", // Ajusta este valor según tus necesidades
        }}
      >
        <Table
          className="w-full "
          style={{ minWidth: `${columns.length * 150}px` }}
          columns={columns}
          data={filteredData}
          getRowKey={getRowKey}
          onOrderChange={onOrderChange}
          onOrderColumnChange={onOrderColumnChange}
          pagination={true}
          onRowClick={handleEdit}
          columnWidths={columnWidths}
          isDraggableColumnEnabled = {isDraggableColumnEnabled}
          onColumnResize={(columnKey, newWidth) => {
            const widthNum = parseInt(newWidth)
            if (selectedView) {
              const matchingColumn = rawColumns.find((c) => c.name === columnKey);
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
                    width_px: widthNum,
                    view_id: selectedView.id,
                    position_num: matchingViewColumn.position_num
                  });
                } else {
                  let filterToAdd = {
                    view_id: selectedView.id,
                    column_id: columnId,
                    visible: true,
                    filter_condition: null,
                    filter_value: null,
                    width_px: widthNum
                  };
                  console.log("bro  NOT matchingViewColumn ")
                  handleAddColumnToView(filterToAdd);
                }
              })();
            }
          }}
        />
      </div>
      {renderForm &&
        renderForm({
          mode: formMode,
          item: selectedItem,
          open: formOpen,
          onClose: () => setFormOpen(false),
          onSubmit: (formData) => {
            if (formMode === "create") {
              onCreate?.(formData);
            } else {
              const itemId = selectedItem?.[rowIdKey];
              onUpdate?.(itemId, formData);
            }
            setFormOpen(false);
          },
          onDelete: (id) => {
            onDelete?.(id);
            setFormOpen(false);
          },
        })}

      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        columns={columns}
        filterDraft={filterDraft}
        filterConditions={filterConditions}
        setFilterDraft={setFilterDraft}
        onAddFilter={handleAddFilter}
        showFilters={true}
      />

      <SortDialog
        open={showSortDialog}
        onOpenChange={setShowSortDialog}
        columns={columns}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        onSetSort={handleSetSort}
      />
    </div>
  );
}
