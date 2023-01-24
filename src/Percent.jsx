import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";
import MyPropTypes from "./prop-types";

export function Percent(props) {
  const { icons, level } = props;
  const Icon = icons[Math.round(level * icons.length / 100)];
  return <Tooltip title={level + "%"}><Icon /></Tooltip>;
}

Percent.propTypes = {
  level: MyPropTypes.percent.isRequired,
  icons: PropTypes.arrayOf(PropTypes.elementType),
};
