import React from "react";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import defaultCast from "./defaultCast";

export default function MaybeTip(props) {
  const { tooltip, children, cast } = props;
  const contentClass = cast.tooltipContent ?? defaultCast.tooltipContent;

  const tooltipEl = tooltip ? typeof tooltip === "string" ? tooltip.split("\n").map((line, idx) => (
    <div key={idx}>{line}</div>
  )) : tooltip : null;

  return tooltipEl ? (
    <Tooltip title={tooltipEl}>
      <span className={contentClass}>
        <span>{ children }</span>
      </span>
    </Tooltip>
  ) : children;
}

MaybeTip.propTypes = {
  tooltip: PropTypes.string,
  children: PropTypes.node,
};
