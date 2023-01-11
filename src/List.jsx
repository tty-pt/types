import React, { useState } from "react";
import PropTypes from "prop-types";
import { cast as c } from "@tty-pt/styles";

const List = React.forwardRef((props, ref) => {
  const { appClasses, data, types, Component, style, ...rest } = props;
  const [ filters, setFilters ] = useState(Object.entries(types).reduce((a, [key, type]) => ({
    ...a,
    [key]: type.initialFilter,
  }), {}));

  const filtersEl = Object.entries(types).map(([key, type]) => {
    return <type.Filter
      key={key}
      dataKey={key}
      data={data}
      type={type}
      value={filters[key]}
      onChange={newValue => setFilters({ ...filters, [key]: newValue })}
      appClasses={appClasses}
    />;
  });

  const filteredData = data.filter(item => Object.entries(filters).reduce(
    (a, [key, filterValue]) => a && types[key].filter(item[key], filterValue),
    true
  ));

  const componentsEl = filteredData.map((item, index) => {
    return (<Component
      key={index}
      index={index}
      appClasses={appClasses}
      data={item}
      { ...rest }
    />);
  });

  return (<div ref={ref} style={style} className={c(appClasses, "vertical overflowAuto")}>
    <div className={c(appClasses, "horizontalSmall flexWrap alignItemsCenter")}>
      { filtersEl }
    </div>

    { componentsEl }
  </div>);
});

List.displayName = "List";

List.propTypes = {
  data: PropTypes.array,
  style: PropTypes.object.isRequired,
  appClasses: PropTypes.object,
  types: PropTypes.object,
  onClick: PropTypes.object.isRequired,
  Component: PropTypes.elementType,
};

export default List;
