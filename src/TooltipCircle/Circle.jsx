import React from "react";
import PropTypes from "prop-types";

export default function Circle(props) {
  const { color, size } = props;

  const sizeProps = size ? {
    height: size + "px",
    width: size + "px",
  } : {};

  return (<div
    style={{
      ...sizeProps,
      backgroundColor: color,
      borderRadius: "50%",
    }}
  />);
}

Circle.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
};


