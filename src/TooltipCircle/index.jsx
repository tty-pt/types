import React from "react";
import PropTypes from "prop-types";
import { useCast } from "@tty-pt/styles";
import { Tooltip } from "@material-ui/core";
import MyPropTypes from "../prop-types";
import Circle from "./Circle";

export default function TooltipCircle(props) {
  const { value, style, size = 12 } = props;
  const c = useCast();

  return (<Tooltip title={value.title}>
    <span className={c("vertical0 justifyContentCenter")} style={style}>
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
