import React from "react";
import PropTypes from "prop-types";
import { IconButton as BaseIconButton, Tooltip } from "@material-ui/core";

export default
function IconButton(props) {
  const {
    Component, className = "", title = "",
    onClick, disabled, iconClassName = "",
  } = props;

  return (<Tooltip title={title}>
    <span className={className}>
      <BaseIconButton
        disabled={disabled}
        onClick={onClick}
      >
        <Component className={iconClassName} />
      </BaseIconButton>
    </span>
  </Tooltip>);
}

IconButton.propTypes = {
  Component: PropTypes.elementType,
  title: PropTypes.string,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};
