import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Trash2, Search, Database } from "lucide-react";
import useEditModeStore from "@/stores/editModeStore";

export default function LogicalTablesSidebar({
  tables = [],
  selectedTable,
  onTableSelect,
  onTableEdit,
  onTableDelete,
  onAddTable,
  loading = false,
}) {
  const { isEditingMode } = useEditModeStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tables based on search term
  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-72 min-w-[288px] border-r border-gray-200 bg-gray-50/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-black" />
            <h2 className="text-sm font-semibold text-gray-900">
              Tablas lógicas
            </h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {tables.length}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Buscar tabla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-8 text-xs border-gray-200 focus:border-gray-300"
          />
        </div>

        {/* Add button */}
        {isEditingMode && (
          <Button
            onClick={onAddTable}
            size="sm"
            className="w-full mt-3 h-8 bg-black hover:bg-gray-800 text-white text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Nueva tabla
          </Button>
        )}
      </div>

      {/* Tables List */}
      <ScrollArea className="h-[calc(100vh-360px)]">
        <div className="p-2 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">
                {searchTerm ? "No se encontraron tablas" : "No hay tablas"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTables.map((table, idx) => (
                <div
                  key={table.id ?? `table-idx-${idx}`}
                  className={`group relative cursor-pointer rounded-md transition-all duration-200 ${
                    selectedTable && selectedTable.id === table.id
                      ? "bg-gray-100 border border-gray-300"
                      : "hover:bg-gray-100 border border-transparent"
                  } ${idx === filteredTables.length - 1 ? "mb-2" : ""}`}
                  onClick={() => onTableSelect(table)}
                >
                  <div className="flex items-center justify-between p-2 pr-1">
                    <div className="flex-1 min-w-0 mr-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-black flex-shrink-0" />
                        <span
                          className={`text-sm truncate ${
                            selectedTable && selectedTable.id === table.id
                              ? "font-medium text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {table.name}
                        </span>
                      </div>
                      {table.description && (
                        <div className="ml-4 mt-1 max-w-[180px]">
                          <p className="text-xs text-gray-500 truncate">
                            {table.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {isEditingMode && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTableEdit(table);
                          }}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          <Edit3 className="w-3 h-3 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTableDelete(table);
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
