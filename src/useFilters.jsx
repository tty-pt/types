import React, { useState, useMemo } from "react";

function getFilterColumns(getType, columns, prefix = "") {
  return Object.entries(columns).reduce(
    (a, [key, value]) => {
      if (!value)
        return a;

      const type = getType(key);
      console.assert(type);

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

// creds to Pedro Cristóvão.
function keyedFilter(type, filterColumns) {
  const ans = {};
  for (const filterColumn of filterColumns) {
    const [beforeDot, ...otherDots] = filterColumn.split(".");
    ans[beforeDot] = otherDots.length > 0
      ? { ...ans[beforeDot], ...keyedFilter(type.types[beforeDot], [otherDots.join(".")]) }
      : type.types[beforeDot].initialFilter;
  }
  return ans;
}

function isIncluded(type, columns, filters, item) {
  // console.log("isIncluded", type, columns, filters, item);
  if (!type.types)
    return type.filter(item, filters);

  for (const key of Object.keys(filters)) {
    const column = columns[key];
    if (!column || typeof column === "boolean")
      continue;

    const subType = type.types[key];
    if (!isIncluded(subType, column, filters[key], item[key]))
      return false;
  }

  return true;
}

function _getFiltersEl(res, type, data, filters, setFilters, prefix = "") {
  // console.log("_getFiltersEl0", res, type, data, filters, setFilters, prefix);
  for (const [key, subType] of Object.entries(type.types)) {
    const filter = filters[key];
    // console.log("_getFiltersEl", key, subType, filter);

    if (filter === undefined)
      continue;

    const fullKey = (prefix ? prefix + "." : "") + key;

    if (subType.types)
      _getFiltersEl(res, subType, data, filter, (newValue, subKey) => setFilters({
        ...filter,
        [subKey]: newValue,
      }, key), fullKey);

    else res.push(<subType.Filter
      key={"filter" + fullKey.replace(".", "-")}
      dataKey={fullKey}
      data={data}
      type={subType}
      value={filter}
      onChange={value => setFilters(value, key)}
    />);
  }
}

function getFiltersEl(type, data, filters, setFilters) {
  if (!data)
    return [];
  let res = [];
  _getFiltersEl(res, type, data, filters, (value, key) => setFilters({
    ...filters,
    [key]: value,
  }));
  return res;
}

export default function useFilters({ data, type, columns }) {
  const filterColumns = useMemo(() => getFilterColumns(key => type.types[key], columns), [columns]);
  const [ filters, setFilters ] =  useState(keyedFilter(type, filterColumns));
  const filtersEl = useMemo(() => getFiltersEl(type, data, filters, setFilters), [data, filters]);
  const filteredData = useMemo(() => data ? data.filter(item => isIncluded(type, columns, filters, item)) : [], [data, filters, columns]);

  if (!data)
    return {
      filtersEl: [(
        <span key="noData">No Data Available</span>
      )],
      filteredData: []
    };

  if (!type.types)
    throw new Error("useFilters type must be RecurseBool");

  // console.log("useFilters", filterColumns, filters, filtersEl, filteredData);

  return { filtersEl, filteredData };
}
