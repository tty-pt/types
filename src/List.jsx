import React from "react";
import PropTypes from "prop-types";
import useFilters from "./useFilters";

const List = React.forwardRef((props, ref) => {
  const { data, type, filters = [], Component, style, ...rest } = props;
  const { filtersEl, filteredData } = useFilters({ data, type, config: filters });

  const componentsEl = filteredData.map((item, index) => {
    return (<Component
      key={index}
      index={index}
      data={item}
      { ...rest }
    />);
  });

  return (<div ref={ref} style={style} className="vertical overflow-auto">
    <div className="horizontal flex-wrap align-items-center justify-content-end">
      { filtersEl }
    </div>

    { componentsEl }
  </div>);
});

List.displayName = "List";

List.propTypes = {
  data: PropTypes.array,
  style: PropTypes.object.isRequired,
  type: PropTypes.any.isRequired,
  filters: PropTypes.array,
  onClick: PropTypes.object.isRequired,
  Component: PropTypes.elementType,
  dependencies: PropTypes.object,
};

export default List;
