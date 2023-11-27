import React from "react";
import PropTypes from "prop-types";
import componentsSub from "./componentsSub";
import MyPropTypes from "./prop-types";

export function Percent(props) {
  const { icons, level } = props;
  const { Tooltip } = componentsSub.use();
  const index = Math.floor(level * (icons.length - 1) / 100);
  const Icon = icons[index];
  return <Tooltip title={level.toFixed(2) + "%"}><Icon /></Tooltip>;
}

Percent.propTypes = {
  level: MyPropTypes.percent.isRequired,
  icons: PropTypes.arrayOf(PropTypes.elementType),
};
