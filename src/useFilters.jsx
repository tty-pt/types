import React, { useState, useMemo } from "react";

function getFilterColumns(getType, columns, prefix = "") {
  return Object.entries(columns).reduce(
    (a, [key, value]) => {
      if (!value)
        return a;

      const type = getType(key);

      if (type.types)
        return getFilterColumns(key => type.types[key], value, prefix + key + ".");

      if (type.SubType) {
        const subType = new type.SubType("dummy", {}, ...type.subTypeArgs);
        return getFilterColumns(() => subType, value, prefix + key + ".");
      }

      return value.filter ? a.concat(prefix + key) : a;
    },
    [],
  );
}

export default function useFilters({ data, type, columns }) {
  const rFilterColumns = getFilterColumns(key => type.types[key], columns);
  console.assert(rFilterColumns);
  // console.log("useFilters", rFilterColumns);
  const filterColumns = useMemo(() => Object.entries(columns).reduce(
    (a, [key, value]) => value && value.filter ? a.concat(key) : a,
    []
  ), [columns]);

  const [ filters, setFilters ] =  useState(filterColumns.reduce((a, key) => ({
    ...a,
    [key]: type.types[key].initialFilter,
  }), {}));

  const filtersEl = useMemo(() => filterColumns.map(key => {
    const subType = type.types[key];

    return (<subType.Filter
      key={"filter-" + key}
      dataKey={key}
      data={data}
      type={subType}
      value={filters[key]}
      onChange={newValue => setFilters({ ...filters, [key]: newValue })}
    />);
  }), [filterColumns, data, filters]);

  const filteredData = useMemo(() => data.filter(item => Object.entries(filters).reduce(
    (a, [key, filterValue]) => a && (!columns[key] || !columns[key].filter || type.types[key].filter(item[key], filterValue)),
    true
  )), [data, filters, columns]);

  return { filtersEl, filteredData };
}
