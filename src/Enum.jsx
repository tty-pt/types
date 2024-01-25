import React from "react";
import PropTypes from "prop-types";
import componentsSub from "./componentsSub";

export function Enum(props) {
  const { values, enumKey, tooltip } = props;
  const { icon, title } = values[enumKey];
  const { Tooltip, [icon + "Icon"]: Icon } = componentsSub.use();
  const iconEl = Icon ? <Icon /> : icon;

  return <Tooltip title={tooltip ?? title}>{iconEl}</Tooltip>;
}

Enum.propTypes = {
  enumKey: PropTypes.any,
  values: PropTypes.objectOf(PropTypes.any),
  tooltip: PropTypes.string,
};
