import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";
import MyPropTypes from "lib/my-prop-types";
import Circle from "./Circle";

export default function TooltipCircle(props) {
  const { value, style } = props;
  return (<Tooltip title={value.title}>
    <span style={style}>
      <Circle color={value.color} size={12} />
    </span>
  </Tooltip>);
}

TooltipCircle.propTypes = {
  value: PropTypes.shape({
    title: PropTypes.string,
    color: MyPropTypes.color,
  }),
  style: MyPropTypes.style,
};
