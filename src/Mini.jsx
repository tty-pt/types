import React from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip } from "@material-ui/core";

export default
function Mini(props) {
  const { state, config = {} } = props;
  const {
    Component,
    extend,
    children = null,
    onClick,
    ...rest
  } = typeof config === "function" ? config(state, props) : config;

  if (!Component) {
    const { index } = props;

    return Object.entries(config).map(([id, value]) => (<Mini
      key={id} id={id} index={index} state={state[id]} config={value} onClick={onClick}
    />));
  }

  if (extend) {
    const { Component: Extends, children: extendChildren = null, ...erest }
      = typeof extend === "function" ? extend(state, {
        ...props,
        Component,
        ...rest,
      }) : extend;

    return (<Extends
      state={state}
      onClick={onClick}
      Component={Component}
      extendChildren={extendChildren}
      { ...rest }
      { ...erest }
    >
      {children}
    </Extends>);
  } else
    return <Component state={state} onClick={onClick} { ...rest }>{children}</Component>;
}

Mini.propTypes = { state: PropTypes.any, config: PropTypes.any };

export function iconButton(state, props) {
  return {
    Component: () => {
      const {
        title = "",
        className = "",
        onClick = () => {},
        disabled = false,
        Component = () => <></>,
        state: outerState,
        ...rest
      } = props;

      return (<Tooltip title={typeof title === "string" ? title : title[state]}>
        <span>
          <IconButton
            className={typeof className === "string" ? className : className[state]}
            disabled={typeof disabled !== "object" ? disabled : disabled[state]}
            onClick={onClick}
          >
            <Component state={outerState} { ...rest } />
          </IconButton>
        </span>
      </Tooltip>);
    },
  };
}
