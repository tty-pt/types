import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";
import MyPropTypes from "./prop-types";

export default function Percent(props) {
  const { icons, level } = props;
  const Icon = icons[Math.round(level * icons.length / 100)];
  const color = level < 15 ? "error" : "inherit";
  return <Tooltip title={level + "%"}><Icon color={color} /></Tooltip>;
}

Percent.propTypes = {
  level: MyPropTypes.percent.isRequired,
  icons: PropTypes.arrayOf(PropTypes.elementType),
};
