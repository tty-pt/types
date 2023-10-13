import React from "react";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import MyPropTypes from "../prop-types";
import { defaultMeta } from "../data-types";
import Circle from "./Circle";
import defaultCast from "../defaultCast";

export default function TooltipCircle(props) {
  const { value = defaultMeta.na, style, size = 20, cast } = props;
  const tooltipCircleClass = cast?.tooltipCircle ?? defaultCast.tooltipCircle;

  return (<Tooltip title={value.title}>
    <span className={tooltipCircleClass} style={style}>
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
