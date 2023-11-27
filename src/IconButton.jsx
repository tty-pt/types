import React from "react";
import PropTypes from "prop-types";
import componentsSub from "./componentsSub";

export default
function IconButton(props) {
  const {
    Component, className = "", title = "",
    onClick, disabled, iconClassName = "",
  } = props;
  const { Tooltip, IconButton: BaseIconButton } = componentsSub.use();

  return (<Tooltip title={title}>
    <span>
      <BaseIconButton
        className={className}
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
