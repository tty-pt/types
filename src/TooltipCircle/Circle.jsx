import React from "react";
import PropTypes from "prop-types";
import { useCast, MagicContext } from "@tty-pt/styles";

export default function Circle(props) {
  const { color = "Success", size, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

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
  dependencies: PropTypes.object,
};
