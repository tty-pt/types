import React from "react";
import PropTypes from "prop-types";
import defaultCast from "../defaultCast";

export default function Circle(props) {
  const { color = "-success", size, cast } = props;
  const outlineClass = cast?.outline ?? defaultCast.outline;

  const sizeProps = size ? {
    height: size + "px",
    width: size + "px",
  } : {};

  return (<div
    className={outlineClass + " background" + color}
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
