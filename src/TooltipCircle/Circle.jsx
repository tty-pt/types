import React from "react";
import PropTypes from "prop-types";

export default function Circle(props) {
  const { color = "-success", size } = props;

  const sizeProps = size ? {
    height: size + "px",
    width: size + "px",
  } : {};

  return (<div
    className={"background" + color}
    style={{
      ...sizeProps,
      borderRadius: "50%",
    }}
  />);
}

Circle.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.number,
};
