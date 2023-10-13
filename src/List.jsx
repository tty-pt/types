import React from "react";
import PropTypes from "prop-types";
import useFilters from "./useFilters";
import defaultCast from "./defaultCast";

const List = React.forwardRef((props, ref) => {
  const { data, type, filters = [], Component, style, cast, ...rest } = props;
  const { filtersEl, filteredData } = useFilters({ data, type, config: filters, cast });
  const filtersRootClass = cast?.filtersRoot ?? defaultCast.filtersRoot;
  const filtersContainerClass = cast?.filtersContainer ?? defaultCast.filtersContainer;

  const componentsEl = filteredData.map((item, index) => {
    return (<Component
      key={index}
      index={index}
      data={item}
      { ...rest }
    />);
  });

  return (<div ref={ref} style={style} className={filtersRootClass}>
    <div className={filtersContainerClass}>
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
