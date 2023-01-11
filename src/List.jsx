import React from "react";
import PropTypes from "prop-types";
import { cast as c } from "@tty-pt/styles";

const List = React.forwardRef((props, ref) => {
  const { appClasses, data, types, Component, style, ...rest } = props;

  const filtersEl = Object.entries(types).map(([key, type]) => {
    return <type.Filter
      key={key}
      dataKey={key}
      data={data}
      type={type}
      appClasses={appClasses}
    />;
  });

  const componentsEl = data.map((item, index) => {
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
