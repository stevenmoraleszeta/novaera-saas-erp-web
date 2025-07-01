"use client";

import { useState, useMemo } from "react";
import Table from "@/components/tables/Table";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown } from "lucide-react";
import SearchBar from "@/components/common/SearchBar";
import FilterDialog from "@/components/tables/dialogs/FilterDialog";
import SortDialog from "@/components/tables/dialogs/SortDialog";

export default function GenericCRUDTable({
  title,
  data = [],
  columns = [],
  getRowKey = (row) => row.id,
  rowIdKey = "id",
  onCreate,
  onUpdate,
  onDelete,
  renderForm,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [activeSort, setActiveSort] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
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
    let result = [...data];

    // Apply filters
    for (const filter of activeFilters) {
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

    // Apply search
    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
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

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-6">
      <div className="flex gap-2">
        {/* Aquí podrías meter vistas o tabs si lo necesitas */}
      </div>
    </div>
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
        onSearch={setSearchTerm}
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
  </div>
      <Table
        columns={columns}
        data={filteredData}
        getRowKey={getRowKey}
        pagination={true}
        onRowClick={handleEdit}
      />

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
        })}

      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        columns={columns}
        filterDraft={filterDraft}
        filterConditions={filterConditions}
        setFilterDraft={setFilterDraft}
        onAddFilter={handleAddFilter}
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
