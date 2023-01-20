import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "@material-ui/core";
import MyPropTypes from "./prop-types";
import { PercentType } from "./data-types";

export function Percent(props) {
  const { icons, level } = props;
  const Icon = icons[Math.round(level * icons.length / 100)];
  return <Tooltip title={level + "%"}><Icon /></Tooltip>;
}

Percent.propTypes = {
  level: MyPropTypes.percent.isRequired,
  icons: PropTypes.arrayOf(PropTypes.elementType),
};

export function makePercent(icons, options = {}) {
  const { BaseType = PercentType } = options;

  function SpecificPercent(props) {
    const { level } = props;
    return <Percent icons={icons} level={level} />
  }

  SpecificPercent.propTypes = {
    level: MyPropTypes.percent.isRequired,
  };

  SpecificPercent.Type = options.makeType
    ? options.makeType(SpecificPercent, BaseType)
    : (class SpecificPercentType extends BaseType {
      constructor(title) {
        super(title, SpecificPercent);
      }
    });

  Object.assign(SpecificPercent.Type.prototype, options);

  return SpecificPercent;
}
