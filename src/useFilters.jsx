import React, { useState, useMemo } from "react";
import { StringFilter } from "./StringFilter";

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

function includes(type, filters, item) {
  // console.log("includes", type, filters, item);
  if (!type.types)
    return type.filter(item, filters);

  for (const [key, filter] of Object.entries(filters)) {
    if (key === "global")
      continue;
    else if (!includes(type.types[key], filter, item[key]))
      return false;
  }

  return true;
}

function globalIncludes(globalFilter, type, filters, item) {
  if (!type.types)
    return globalFilter(type, item, filters);

  for (const [key, subType] of Object.entries(type.types))
    if (globalIncludes(globalFilter, subType, filters, item[key]))
      return true;

  return false;
}

function defaultGlobalFilter(type, item, filters) {
  return type.format(item).substring(0, filters.global.length) === filters.global;
}

function _getFiltersEl(res, superType, type, data, config, filters, setFilters, prefix = "") {
  // console.log("_getFiltersEl", superType.title, type.title, config, filters, prefix);
  for (const con of config) {
    switch (typeof con) {
    case "string": break;
    case "object":
      if (con.filters) {
        let deepRes = [];
        _getFiltersEl(deepRes, superType, type, data, con.filters, filters, setFilters, prefix);
        res.push(<div className={con.className}>{ deepRes }</div>);
      } else
        res.push(con);
      continue;
    default:
      throw new Error("@tty-pt/types/useFilters: Unsupported filter type");
    }

    const [headDot, ...tailDots] = con.split(".");

    const subType = type.types[headDot];

    if (!subType)
      throw new Error("@tty-pt/types/useFilters: No such subType");

    const fullKey = (prefix ? prefix + "." : "") + headDot;
    const filter = filters[headDot];

    if (subType.types && tailDots.length) {
      _getFiltersEl(res, superType, subType, data, [tailDots.join(".")], filter, (newValue, subKey) => setFilters({
        ...filter,
        [subKey]: newValue,
      }, headDot), fullKey);

      continue;
    }

    res.push(<subType.Filter
      key={"filter" + fullKey.replace(".", "-")}
      dataKey={fullKey}
      data={data}
      type={subType}
      superType={superType}
      value={filter}
      onChange={value => setFilters(value, headDot)}
    />);
  }
}

function getFiltersEl(type, data, config, filters, setFilters) {
  if (!data)
    return [];
  let res = [];
  _getFiltersEl(res, type, type, data, config, filters, (value, key) => setFilters({
    ...filters,
    [key]: value,
  }));
  return res;
}

function _flattenConfig(ret, config) {
  for (const con of config) {
    switch (typeof con) {
    case "string":
      ret.push(con);
      break;
    case "object":
      if (ret.filters)
        _flattenConfig(ret, ret.filters);
      break;
    }
  }
}

function flattenConfig(config) {
  const ret = [];
  _flattenConfig(ret, config);
  return ret;
}

function DefaultGlobalComponent(props) {
  return <StringFilter title="Multiple fields" { ...props } />;
}

export default function useFilters({ data, type, config, global }) {
  const flatConfig = useMemo(() => flattenConfig(config), [config]);
  const [ filters, setFilters ] =  useState(keyedFilter(type, flatConfig));
  const {
    filter: globalFilter = defaultGlobalFilter,
    Component: GlobalComponent = DefaultGlobalComponent,
  } = global ?? {};
  const filtersEl = useMemo(() => (global ? [(
    <GlobalComponent
      key="filter-global" dataKey="global" data={data} type={type} superType={type}
      onChange={value => setFilters({ ...filters, global: value })}
    />
  )] : []).concat(getFiltersEl(type, data, config, filters, setFilters)), [data, config, filters]);
  const filteredData = useMemo(() => data ? data.filter(item => includes(type, filters, item) && (!global || !filters.global || globalIncludes(globalFilter, type, filters, item))) : [], [data, filters]);

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
