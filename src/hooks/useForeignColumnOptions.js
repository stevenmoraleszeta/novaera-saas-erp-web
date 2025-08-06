// useForeignColumnOptions.js
import React, { useEffect, useState } from "react";
import {
    getLogicalTableRecords,
} from "@/services/logicalTableService";

export function useForeignColumnOptions(columns) {

    const [optionsByColumn, setOptionsByColumn] = useState({});

    useEffect(() => {
        const fetchOptions = async () => {
            const result = {};
            for (const col of columns) {
                if (col.is_foreign_key && col.foreign_table_id && col.foreign_column_name) {
                    const records = await getLogicalTableRecords(col.foreign_table_id);
                    result[col.name] = records.map(r => ({
                        value: r.id.toString(),
                        label: r.record_data?.[col.foreign_column_name] || r.name || `ID ${r.id}`
                    }));
                }
            }
            setOptionsByColumn(result);
        };

        if (columns?.length) fetchOptions();
    }, [columns]);

    return optionsByColumn;
}
