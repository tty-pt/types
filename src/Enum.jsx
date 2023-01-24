import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";

export function Enum(props) {
  const { values, enumKey } = props;
  const value = values[enumKey];

  if (!value)
    throw new Error("Enum: no value for key " + enumKey);

  const { Icon, title } = value;

  return <Tooltip title={title}><Icon /></Tooltip>;
}

Enum.propTypes = {
  enumKey: PropTypes.any,
  values: PropTypes.objectOf(PropTypes.any),
};
