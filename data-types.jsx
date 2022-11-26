import React from "react";
import PropTypes from "prop-types";
import MyPropTypes from "./prop-types";
import { _get } from "./utils";

function TextCenter(props) {
  const { children } = props;

  return <div style={{ textAlign: "center" }}>{children}</div>;
}

TextCenter.propTypes = {
  children: PropTypes.node,
};

function FHCenter(props) {
  const { children } = props;

  return (<div style={{
    alignItems: "center",
    justifyContent: "center",
    display: "flex"
  }}>
    { children }
  </div>);
}

FHCenter.propTypes = {
  children: PropTypes.node,
};

export class IntegerType {
  constructor(title) {
    this.title = title;
    this.propType = MyPropTypes.integer;
  }

  renderColumn(value) {
    return <TextCenter>{value}</TextCenter>;
  }

  renderDetails(value) {
    return value;
  }

  format(value) {
    return value;
  }

  invalid(value) {
    return value;
  }
}

export class StringType extends IntegerType {
  constructor(title) {
    super(title);
    this.propType = PropTypes.string;
  }

  invalid(value) {
    return !value;
  }
}

export class ComponentType extends StringType {
  constructor(title, Component, propType, accessor, defaultProp) {
    super(title);
    this.propType = propType;
    this.accessor = accessor || "";
    this.defaultProp = defaultProp || "";
    this.Component = Component;
  }

  read(value) {
    return _get(value, this.accessor);
    // if (typeof value === "object") 
    // else
    //   return value;
  }

  renderColumn(value) {
    const props = this.defaultProp ? {
      [this.defaultProp]: this.read(value),
    } : {};

    const Component = this.Component;

    return <FHCenter><Component { ...props } /></FHCenter>;
  }

  format(value) {
    return this.read(value);
  }

  invalid(value) {
    return this.read(value);
  }

  renderDetails(value) {
    return this.read(value);
  }
}

export class PercentType extends ComponentType {
  constructor(title, Percent, shape, accessor) {
    super(title, Percent, accessor === "" ? MyPropTypes.percent : PropTypes.shape({
      ...shape,
      [accessor]: MyPropTypes.percent,
    }), accessor, "level");
  }

  format(value) {
    return super.read(value) + "%";
  }

  invalid(value) {
    return super.read(value) < 15;
  }
}

export class LevelPercentType extends PercentType {
  constructor(title, Percent, shape) {
    super(title, Percent, shape, "level");
  }
}

export class EnumType extends ComponentType {
  constructor(title, Enum, declaration, map, shape, accessor) {
    super(title, Enum, accessor ? MyPropTypes.enum(declaration) : PropTypes.shape({
      ...shape,
      [accessor]: MyPropTypes.enum(declaration),
    }), accessor, "value");
    this.declaration = declaration;
    this.map = map;
  }

  mapped(value) {
    return this.declaration[this.read(value)];
  }

  format(value) {
    return this.mapped(value).title;
  }
}

export class ValueEnumType extends EnumType {
  constructor(title, Enum, map, declaration, shape) {
    super(title, Enum, declaration, map, shape, "value");
  }
}
