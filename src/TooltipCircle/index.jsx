import React from "react";
import PropTypes from "prop-types";
import Tooltip from "@mui/material/Tooltip";
import MyPropTypes from "../prop-types";
import { defaultMeta } from "../data-types";
import Circle from "./Circle";

export default function TooltipCircle(props) {
  const { value = defaultMeta.na, style, size = 12 } = props;

  return (<Tooltip title={value.title}>
    <span className="vertical-0 justify-content" style={style}>
      <Circle color={value.color} size={size} />
    </span>
  </Tooltip>);
}

TooltipCircle.propTypes = {
  value: PropTypes.shape({
    title: PropTypes.string,
    color: MyPropTypes.color.isRequired,
  }),
  style: MyPropTypes.style,
  size: MyPropTypes.integer,
};
