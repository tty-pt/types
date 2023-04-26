import React, { useState, useEffect } from "react";

export function useMeta(handler) {
  const [state, setState] = useState(handler.cache);
  useEffect(() => handler.subscribe(setState), [setState]);
  return state;
}

export function withMeta(handler) {
  return function innerWithEndpoint(Component) {
    function ComponentWithEndpoint(props) {
      const value = useMeta(handler);
      return <Component {...value} {...props} />;
    }
    return ComponentWithEndpoint;
  };
}
