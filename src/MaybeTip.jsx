import React from "react";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import { useCast, MagicContext } from "@tty-pt/styles";

export default function MaybeTip(props) {
  const { tooltip, children, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  const tooltipEl = tooltip ? tooltip.split("\n").map((line, idx) => (
    <div key={idx}>{line}</div>
  )) : null;

  return tooltipEl ? (
    <Tooltip title={tooltipEl}>
      <span className={c("horizontal0 alignItemsCenter")}>
        <span>{ children }</span>
        <mark className={c("colorInherit fontWeightBold backgroundInherit")}>*</mark>
      </span>
    </Tooltip>
  ) : children;
}

MaybeTip.propTypes = {
  tooltip: PropTypes.string,
  children: PropTypes.node,
  dependencies: PropTypes.object,
};
