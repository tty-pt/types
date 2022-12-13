import React from "react";
import PropTypes from "prop-types";
import { Typography, } from "@material-ui/core";

export default function Circle(props) {
  const { color, size } = props;

  const sizeProps = size ? {
    height: size + "px",
    width: size + "px",
  } : {};

  return (<Typography
    component="div"
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


