import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";
import MyPropTypes from "./prop-types";

export function Enum(props) {
  const { values, enumKey } = props;
  const value = values[enumKey];

  if (!value)
    throw new Error("Enum: no value for key " + enumKey);

  const { Icon, title } = value;

  return <Tooltip title={title}><Icon /></Tooltip>;
}

Enum.propTypes = {
  enumKey: MyPropTypes.integer,
  values: PropTypes.objectOf(PropTypes.any),
};
