import React, { useState, useMemo } from "react";

function getFilterColumnsEx(ret, type, columns, prefix = "") {
  if (columns.filter)
    ret.push(prefix.substring(1));

  if (!type.types && !type.SubType)
    return;

  const subType = type.SubType ? new type.SubType("dummy", {}, ...type.subTypeArgs) : null;
  const getType = type.types ? key => type.types[key] : () => subType;

  for (const [key, column] of Object.entries(columns)) {
    if (!column)
      continue;

    const type = getType(key);
    getFilterColumnsEx(ret, type, column, prefix + "." + key);
  }
}

function getFilterColumns(type, columns) {
  let ret = [];
  getFilterColumnsEx(ret, type, columns);
  return ret;
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

function _getFiltersEl(res, superType, type, data, filters, setFilters, dependencies, prefix = "") {
  for (const [key, filter] of Object.entries(filters)) {
    const subType = type.types[key];

    const fullKey = (prefix ? prefix + "." : "") + key;

    if (subType.types)
      _getFiltersEl(res, superType, subType, data, filter, (newValue, subKey) => setFilters({
        ...filter,
        [subKey]: newValue,
      }, key), dependencies, fullKey);

    else res.push(<subType.Filter
      key={"filter" + fullKey.replace(".", "-")}
      dataKey={fullKey}
      data={data}
      type={subType}
      superType={superType}
      value={filter}
      onChange={value => setFilters(value, key)}
    />);
  }
}

function getFiltersEl(type, data, filters, setFilters, dependencies) {
  if (!data)
    return [];
  let res = [];
  _getFiltersEl(res, type, type, data, filters, (value, key) => setFilters({
    ...filters,
    [key]: value,
  }), dependencies);
  return res;
}

export default function useFilters({ data, type, columns, dependencies }) {
  const filterColumns = useMemo(() => getFilterColumns(type, columns), [columns]);
  const [ filters, setFilters ] =  useState(keyedFilter(type, filterColumns));
  const filtersEl = useMemo(() => getFiltersEl(type, data, filters, setFilters, dependencies), [data, filters]);
  const filteredData = useMemo(() => data ? data.filter(item => isIncluded(type, columns, filters, item)) : [], [data, filters, columns]);
  // console.log("useFilters", filterColumns, filters);

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
