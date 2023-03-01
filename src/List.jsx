import React from "react";
import PropTypes from "prop-types";
import { useCast } from "@tty-pt/styles";
import useFilters from "./useFilters";

const List = React.forwardRef((props, ref) => {
  const { data, type, columns = {}, Component, style, ...rest } = props;
  const c = useCast();

  const { filtersEl, filteredData } = useFilters({ data, type, columns });

  const componentsEl = filteredData.map((item, index) => {
    return (<Component
      key={index}
      index={index}
      data={item}
      { ...rest }
    />);
  });

  return (<div ref={ref} style={style} className={c("vertical overflowAuto")}>
    <div className={c("horizontal flexWrap alignItemsCenter justifyContentEnd")}>
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
  columns: PropTypes.object,
  onClick: PropTypes.object.isRequired,
  Component: PropTypes.elementType,
};

export default List;
