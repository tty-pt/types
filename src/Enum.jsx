import React from "react";
import PropTypes from "prop-types";
import componentsSub from "./componentsSub";
import Tooltip from "@material-ui/core/Tooltip";

export function Enum(props) {
  const { values, enumKey, tooltip } = props;
  const value = values[enumKey];

  if (!value)
    throw new Error("Enum: no value for key " + enumKey);

  const { Icon, title } = value;

  return <Tooltip title={tooltip ?? title}><Icon /></Tooltip>;
}

Enum.propTypes = {
  enumKey: PropTypes.any,
  values: PropTypes.objectOf(PropTypes.any),
  tooltip: PropTypes.string,
};
