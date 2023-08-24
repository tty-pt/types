import React from "react";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";

export default function MaybeTip(props) {
  const { tooltip, children } = props;

  const tooltipEl = tooltip ? tooltip.split("\n").map((line, idx) => (
    <div key={idx}>{line}</div>
  )) : null;

  return tooltipEl ? (
    <Tooltip title={tooltipEl}>
      <span className="horizontal-0 align-items">
        <span>{ children }</span>
        <mark className="color font-weight background">*</mark>
      </span>
    </Tooltip>
  ) : children;
}

MaybeTip.propTypes = {
  tooltip: PropTypes.string,
  children: PropTypes.node,
};
