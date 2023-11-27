import React from "react";
import PropTypes from "prop-types";
import {
  IconButton,
  Tooltip
} from "@mui/material";

export default
function Mini(props) {
  const { state, config = {}, onClick, ...rem } = props;
  const {
    Component,
    extend,
    children = null,
    ...rest
  } = typeof config === "function" ? config(state, props) : config;

  if (!Component) {
    const realOnClick = typeof onClick === "function" ? onClick(props) : onClick;

    return Object.entries(config).map(([id, value]) => (<Mini
      key={id} id={id} state={state[id]} config={value} onClick={e => realOnClick[id](state, e)} {...rem}
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
      { ...rem }
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
