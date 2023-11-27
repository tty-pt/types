import React from "react";
import PropTypes from "prop-types";
import Tooltip from "@mui/material/Tooltip";
import MyPropTypes from "./prop-types";

export function Percent(props) {
  const { icons, level } = props;
  const Icon = icons[Math.floor(level * (icons.length - 1) / 100)];
  return <Tooltip title={level.toFixed(2) + "%"}><Icon /></Tooltip>;
}

Percent.propTypes = {
  level: MyPropTypes.percent.isRequired,
  icons: PropTypes.arrayOf(PropTypes.elementType),
};
