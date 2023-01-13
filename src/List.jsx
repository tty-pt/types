import React, { useState } from "react";
import PropTypes from "prop-types";
import { useCast } from "@tty-pt/styles";

const List = React.forwardRef((props, ref) => {
  const { data, types, Component, style, ...rest } = props;
  const c = useCast();

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
      data={item}
      { ...rest }
    />);
  });

  return (<div ref={ref} style={style} className={c("vertical overflowAuto")}>
    <div className={c("horizontalSmall flexWrap alignItemsCenter justifyContentSpaceBetween")}>
      { filtersEl }
    </div>

    { componentsEl }
  </div>);
});

List.displayName = "List";

List.propTypes = {
  data: PropTypes.array,
  style: PropTypes.object.isRequired,
  types: PropTypes.object,
  onClick: PropTypes.object.isRequired,
  Component: PropTypes.elementType,
};

export default List;
