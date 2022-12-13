import React from "react";
import PropTypes from "prop-types";

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
    this.detailsTitle = title;
  }

  read(value) {
    return value;
  }

  renderValue(value) {
    return value;
  }

  renderColumn(value) {
    return <TextCenter>{this.renderValue(value)}</TextCenter>;
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
  }

  invalid(value) {
    return !value;
  }
}

export class ComponentType extends StringType {
  constructor(title, Component) {
    super(title);
    this.defaultProp = "value";
    this.Component = Component;
  }

  renderValue(value) {
    const props = {
      [this.defaultProp]: this.read(value),
    };

    const Component = this.Component;

    return <Component { ...props } />;
  }

  renderColumn(value) {
    return <FHCenter>{ this.renderValue(value) }</FHCenter>;
  }

  format(value) {
    return this.read(value);
  }

  invalid(value) {
    return this.read(value);
  }
}

export class PercentType extends ComponentType {
  constructor(title, Percent) {
    super(title, Percent);
    this.defaultProp = "level";
  }

  format(value) {
    return this.read(value) + "%";
  }

  invalid(value) {
    return this.read(value) < 15;
  }
}

export class EnumType extends ComponentType {
  constructor(title, Enum, map) {
    super(title, Enum);
    this.map = map;
  }

  mapped(value) {
    return this.map[this.read(value)];
  }

  format(value) {
    return this.mapped(value).title;
  }
}

export class RecurseBoolType extends EnumType {
  constructor(title, Enum, map, types, badState) {
    super(title, Enum, map);
    this.types = types;
    this.goodState = 0;
    this.badState = badState;
  }

  read(value) {
    return this.invalid(value) ? this.badState : this.goodState;
  }

  invalid(value) {
    const entries = Object.entries(value);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const [ key, value ] = entry;
      const type = this.types[key];
      if (type.invalid(value))
        return true;
    }

    return false;
  }
}
