import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";
import MyPropTypes from "./prop-types";
import { EnumType, BoolType, RecurseBoolType } from "./data-types";

export function Enum(props) {
  const { values, enumKey } = props;
  const value = values[enumKey];

  if (!value)
    throw new Error("Enum: no value for key " + enumKey);

  const { Icon, title } = value;

  return <Tooltip title={title}><Icon /></Tooltip>;
}

Enum.propTypes = {
  enumKey: MyPropTypes.integer,
  values: PropTypes.objectOf(PropTypes.any),
};

function makeSpecificEnum(declaration, map) {
  function SpecificEnum(props) {
    const { value } = props;
    return <Enum values={map} enumKey={value} />;
  }

  SpecificEnum.propTypes = {
    value: MyPropTypes.enum(declaration),
  };

  return SpecificEnum;
}

export function makeEnum(declaration, map, options = {}) {
  const { BaseType = EnumType, SpecificEnum = makeSpecificEnum(declaration, map) } = options;

  SpecificEnum.Type = options.makeType
    ? options.makeType(SpecificEnum, BaseType)
    : (class SpecificEnumType extends BaseType {
      constructor(title, ...args) {
        super(title, SpecificEnum, declaration, map, ...args);
      }
    });

  Object.assign(SpecificEnum.Type.prototype, options);

  return SpecificEnum;
}

export function makeBool(declaration, map, badState, options = {}) {
  const SpecificBool = makeEnum(declaration, map, {
    BaseType: BoolType,
    makeType: (SpecificBool, BaseType) => class SpecificBoolType extends BaseType {
      constructor(title, ...args) {
        super(title, SpecificBool, declaration, map, badState, ...args);
      }
    },
    ...options,
  });

  return SpecificBool;
}

export function makeRecurseBool(declaration, map, badState, types, options = {}) {
  return makeBool(declaration, map, badState, {
    BaseType: RecurseBoolType,
    makeType: (SpecificBool, BaseType) => class SpecificRecurseBoolType extends BaseType {
      constructor(title, ...args) {
        super(title, SpecificBool, declaration, map, badState, types, ...args);
      }
    },
    ...options,
  });
}
