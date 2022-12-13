import PropTypes from "prop-types";

function validateRange(min, value, max) {
  if (typeof value !== "number")
    return new Error("Ranged value is not a number");

  if (value < min || value > max)
    return new Error("Ranged value (" + value + ") not within range (" + min + "-" + max + ")");

  return null;
}

function validateEnum(enumV, value) {
  if (typeof value !== "number" || !Number.isInteger(value))
    return new Error("Enum value is not an integer number");

  const keysLength = Object.keys(enumV).length;

  if (value < 0 || value > keysLength)
    return new Error("Enum value (" + value + ") outside of range (0-" + keysLength + ")");

  return null;
}

function rangedNumber(min, max) {
  function rangedPropType(props, propName) {
    const value = props[propName];

    if (typeof value === "undefined")
      return null;

    return validateRange(min, value, max);
  }

  rangedPropType.isRequired = function(props, propName) {
    const value = props[propName];

    if (typeof value === "undefined")
      return new Error("Required ranged value prop not set");

    return validateRange(min, value, max);
  };

  return rangedPropType;
}

function enumValue(declaration) {
  return function (props, propName) {
    const value = props[propName];

    if (typeof value === "undefined")
      return new Error("Enum value is required");

    return validateEnum(declaration, value);
  };
}

function validateInteger(value) {
  if (typeof value !== "number")
    return new Error("Enum value is not a number");

  if (!Number.isInteger(value))
    return new Error("Enum value is not an integer");

  return null;
}

function integer(props, propName) {
  return validateInteger(props[propName]);
}

function rangedInteger(min, max) {
  return function (props, propName) {
    const value = props[propName];
    const ret = validateInteger(value);

    if (ret)
      return ret;

    if (value < min || value > max)
      return new Error("rangedInteger is not within range");

    return null;
  };
}

const MyPropTypes = {
  rangedNumber,
  percent: rangedNumber(0, 100),
  enum: enumValue,
  integer,
  rangedInteger,
  color: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.string),
  bool: rangedInteger(0, 1),
};

export default MyPropTypes;
