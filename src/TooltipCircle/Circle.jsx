import React from "react";
import PropTypes from "prop-types";
import { useCast } from "@tty-pt/styles";

export default function Circle(props) {
  const { color = "Success", size } = props;
  const c = useCast();

  const sizeProps = size ? {
    height: size + "px",
    width: size + "px",
  } : {};

  return (<div
    className={c("background" + color)}
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
