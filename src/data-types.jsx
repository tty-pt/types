import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CheckboxComponent from "@mui/material/Checkbox";
import CancelIcon from "@mui/icons-material/Cancel";
import { mapCount } from "./utils";
import { Percent as PercentComponent } from "./Percent";
import { Enum as EnumComponent } from "./Enum";
import { StringFilter } from "./StringFilter";
import defaultCast from "./defaultCast";
// import pkg from "./../package.json";
// console.log("TYPES ", pkg.version);

export
const defaultMeta = {
  na: {
    title: "N/A",
    value: "undefined",
    color: "-black",
    Icon: CancelIcon,
  },
  naTooltip: "Not Available",
  t: a => a,
};

export
function metaMix(a, b) {
  const c = { ...a };
  delete c.getter;
  delete c.subGetter;
  return { ...defaultMeta, ...c, ...b };
}

export
function extend(DefaultType, passArgs, options) {
  const { BaseType = DefaultType } = options;

  const Type = options.makeType
    ? options.makeType(BaseType)
    : (class SpecificType extends BaseType {
      constructor(title, meta, ...args) {
        super(title, meta, ...passArgs, ...args);
      }
    });

  Object.assign(Type.prototype, options);
  Object.defineProperty(Type, 'name', { value: BaseType.name });

  return Type;
}

function dec2hex(dec) {
  return dec.toString(16).padStart(2, "0");
}

function toDateTimeLocal(date) {
  if (!date)
    return null;
  const iso = date.toISOString();
  return iso.substring(0, iso.length - 1);
}

function delKey(object, key) {
  const ret = { ...object };
  delete ret[key];
  if (!Object.keys(ret).length)
    return null;
  return ret;
}

function TextCenter(props) {
  const { children, cast } = props;
  const textCenterClass = cast.TextCenter ?? defaultCast.TextCenter;
  return <div className={textCenterClass}>{children}</div>;
}

TextCenter.propTypes = {
  children: PropTypes.node,
};

function FHCenter(props) {
  const { children, cast } = props;
  const fhCenterClass = cast.FHCenter ?? defaultCast.FHCenter;
  return (<div className={fhCenterClass}>
    { children }
  </div>);
}

FHCenter.propTypes = {
  children: PropTypes.node,
};

function TextFilter(props) {
  const { type, ...rest} = props;
  return <StringFilter title={type.title} { ...rest } />;
}

TextFilter.propTypes = {
  type: PropTypes.any,
  value: PropTypes.string,
  dataKey: PropTypes.string,
  onChange: PropTypes.func,
};

export
function Filter(props) {
  const { chipKey, label, active, value, cast, ...rest } = props;
  const activeClass = cast?.Enum?.Filter?.active ?? defaultCast.Enum.Filter.active;
  const inactiveClass = cast?.Enum?.Filter?.inactive ?? defaultCast.Enum.Filter.inactive;

  return (<Chip
    data-testid={"chip-" + chipKey}
    label={`${label} (${value})`}
    className={active ? activeClass : inactiveClass}
    { ...rest }
  />);
}

Filter.propTypes = {
  label: PropTypes.string,
  chipKey: PropTypes.string,
  value: PropTypes.any,
  active: PropTypes.bool,
};

export class Integer {
  constructor(title, meta = {}) {
    this.title = title;
    this.meta = meta;
    this.detailsTitle = title;
  }

  realRead(value) {
    return value;
  }

  read(value) {
    return this.realRead(value);
  }

  renderValue(value, _data, _index, _key, meta, _cast) {
    const upMeta = metaMix(meta, this.meta);

    return value === undefined ? (
      <Tooltip title={upMeta.naTooltip}>{upMeta.na.title}</Tooltip>
    ) : value;
  }

  renderColumn(value, data, index, key, meta, cast) {
    return <TextCenter
      cast={cast}
      data-testid={"column-" + key}
    >
      {this.renderValue(value, data, index, key, meta, cast)}
    </TextCenter>;
  }

  format(value, _data, _meta) {
    return "" + value;
  }

  invalid(value) {
    return value === undefined || value;
  }

  Label(props) {
    const { upMeta, self } = props;
    const meta = metaMix(upMeta, self.meta);
    return <div>{ meta.t("No info") }</div>;
  }

  filter(value, filterValue) {
    return filterValue === undefined || this.read(value) === filterValue;
  }

  Filter(props) {
    return <TextFilter { ...props } />;
  }

  mock() {
    return Math.floor(Math.random());
  }

  metaPreprocess(data, meta, parentKey) {
    const afterAt = (parentKey ?? "@").split("@")[1];
    const dots = afterAt.split(".");

    if (dots.length && dots[dots.length - 1] && this.meta.getter)
      return this.meta.getter(this, data, meta, parentKey);
  }

  preprocess(data, meta, parentKey) {
    return this.metaPreprocess(data, meta, parentKey) ?? data ?? this.meta.default;
  }

  diff(value, previous) {
    return value !== previous;
  }

  onChange(value /*, previous */) {
    if (this.meta.onChange)
      this.meta.onChange(value);
  }

  detailsTooltip(value, data, meta) {
    return value === undefined ? metaMix(meta, this.meta).naTooltip : this.format(value, data, meta);
  }
}

export class Str extends Integer {
  constructor(title, meta) {
    super(title, meta);
    this.initialFilter = "";
  }

  invalid(value) {
    return value === undefined || !value;
  }

  filter(value, filterValue) {
    return this.read(value).startsWith(filterValue);
  }

  mock() {
    const arr = new Uint8Array(20);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
  }
}

export class Component extends Str {
  constructor(title, meta) {
    super(title, meta);
    delete this.initialFilter;
  }

  renderColumn(value, data, index, key, meta, cast) {
    return <FHCenter
      cast={cast}
      data-testid={"column-" + key}
    >
      { this.renderValue(value, data, index, key, meta, cast) }
    </FHCenter>;
  }

  format(value, _data, _meta) {
    return value;
  }
}

export class Percent extends Component {
  constructor(title, meta, icons) {
    super(title, meta);
    this.icons = icons;
  }

  renderValue(value, _data, _index, _key, meta, _cast) {
    const upMeta = metaMix(meta, this.meta);
    if (!value)
      return <EnumComponent
        values={{ [undefined]: upMeta.na }}
        enumKey={undefined}
        tooltip={upMeta.naTooltip}
      />;

    return <PercentComponent icons={this.icons} level={value} />;
  }

  format(value, _data, _meta) {
    return value + "%";
  }

  invalid(value) {
    return value === undefined || isNaN(value) || value < 0 || value > 100;
  }
}

Percent.extend = function extendPercent(icons, options = {}) {
  return extend(Percent, [icons], options);
};


function EnumLabel(props) {
  const { self, upMeta, index, enumKey: key, cast } = props;
  const titleClass = cast.title ?? defaultCast.title;
  // const invalidClass = cast.invalid ?? defaultCast.invalid;
  const enumLabelClass = cast.Enum?.Label ?? defaultCast.Enum.Label;

  return (<table key={self.constructor.name + "-" + key} className={enumLabelClass}><tbody>{
    Object.values(self.declaration).concat([undefined]).sort().map(value => {
      const mapped = self.mapped(value, upMeta);
      const invalidEl = self.invalid(value) ? (
        <td>*</td>
      ) : <td></td>;;

      return (<tr key={key + "-" + value}>
        <td>{ self.renderValue(value, {}, index, key, upMeta, cast) }</td>
        <td>{ mapped.value ?? value }</td>
        <td className={titleClass}>{ metaMix(upMeta, self.meta).t(mapped.title) }</td>
        { invalidEl }
      </tr>);
    })
  }</tbody></table>);
}

export class Enum extends Component {
  constructor(title, meta, declaration, map) {
    super(title, meta);
    this.initialFilter = null;
    this.declaration = declaration;
    this.map = map;
  }

  renderValue(value, _data, _index, _key, meta, _cast) {
    const upMeta = metaMix(meta, this.meta);
    return <EnumComponent
      values={{ ...this.map,  [undefined]: upMeta.na }}
      enumKey={value}
      tooltip={value === undefined ? upMeta.naTooltip : null}
    />;
  }

  Label(props) {
    return EnumLabel(props);
  }

  mapped(value, meta) {
    const upMeta = metaMix(meta, this.meta);
    return this.map[value] ?? upMeta.na;
  }

  format(value, meta, _data) {
    const upMeta = metaMix(meta, this.meta);
    return upMeta.t(this.mapped(value, meta).title);
  }

  filter(value, filterValue) {
    return filterValue === null || filterValue[value];
  }

  Filter(props) {
    const { type, superType, value, onChange, dataKey, data, cast } = props;
    const enumFilterClass = cast?.Enum?.Filter?.root ?? defaultCast.Enum.Filter.root;
    const numbers = mapCount(superType, data, dataKey);

    const filtersEl = Object.values(type.declaration).map(key => {
      return (<Filter
        key={key}
        chipKey={dataKey + "-" + key}
        label={type.map[key].title}
        value={numbers[key] ?? 0}
        cast={cast}
        active={value ? value[key] : false}
        onClick={value?.[key] ? () => onChange(delKey(value, key)) : () => onChange({
          ...(value ?? {}),
          [key]: true,
        })}
      />);
    });

    return (
      <div data-testid={"filter-" + dataKey} className={enumFilterClass}>
        { filtersEl }
      </div>
    );
  }

  invalid(value) {
    if (value === undefined)
      return true;
    return !this.map[value].valid;
  }
}

Enum.extend = function extendEnum(declaration, map, options = {}) {
  return extend(Enum, [declaration, map], options);
};

export class Bool extends Enum {
  constructor(title, meta, map, declaration = { OK: true, ERROR: false }) {
    super(title, meta, declaration, map);
  }

  filter(value, filterValue) {
    return filterValue === null || (
      filterValue === "undefined" && value === undefined
    ) || value === filterValue;
  }

  Filter(props) {
    if (props.superType.meta?.Filter?.Bool)
      return props.superType.meta.Filter.Bool(props);

    const { type, superType, value, onChange, dataKey, data } = props;
    const numbers = mapCount(superType, data, dataKey);

    const valuesMap = {
      0: {
        value: 0,
        mapped: null,
        label: "unfiltered (" + (numbers[null] ?? 0) + ")",
      },
      1: {
        value: 1,
        mapped: false,
        label: "false (" + (numbers[false] ?? 0) + ")",
      },
      2: {
        value: 2,
        mapped: true,
        label: "true (" + (numbers[true] ?? 0) + ")",
      },
      3: { // only show undefined values
        value: 3,
        mapped: "undefined",
        label: "unset (" + (numbers[undefined] ?? 0) + ")",
      },
    };

    const reverseMap = {
      [null]: 0,
      [false]: 1,
      [true]: 2,
      ["undefined"]: 3
    };

    const [current, setCurrent] = useState(reverseMap[value]);
    const mapped = valuesMap[current];

    function handleChange(e) {
      const key = new Number(e.target.value);
      setCurrent(key);
      const mapped = valuesMap[key];
      onChange(mapped.mapped);
    }

    // helperText="Please select your currency"
    return (<TextField
      select
      label={type.title}
      value={mapped.value}
      onChange={handleChange}
    >
      {Object.values(valuesMap).map((option) => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </TextField>);
  }
}

Bool.extend = function extendBool(map, options = {}) {
  return extend(Bool, [map], options);
};

function InnerCheckbox(props) {
  const { name, index, value } = props;
  const [ checked, setChecked ] = useState(value);

  useEffect(() => {
    setChecked(value);
  }, [value]);

  return (<CheckboxComponent
    name={name + "_" + index}
    checked={checked}
    onChange={() => setChecked(!checked)}
  />);
}

InnerCheckbox.propTypes = {
  name: PropTypes.string,
  index: PropTypes.number,
  value: PropTypes.bool,
};

export class Checkbox extends Bool {
  constructor(title, meta, map) {
    super(title, meta, map);
  }

  read(value) {
    return super.read(value) === false; // here we reverse
  }

  renderValue(value, _data, index, key, _meta, _cast) {
    return (<InnerCheckbox
      name={key}
      index={index}
      value={value}
    />);
  }
}

export class Shape extends Bool {
  constructor(title, meta, types, map, declaration) {
    super(title, meta, map, declaration);
    this.types = types;
  }

  realRead(value, dataKey = []) {
    if (value === undefined)
      return;

    if (dataKey.length) {
      const [ head, ...tail ] = dataKey;
      return this.types[head].realRead(value[head], tail);
    }

    return value;
  }

  read(value) {
    if (value === undefined)
      return false;

    for (const [key, val] of Object.entries(value)) {
      const type = this.types[key];
      if (type.invalid(type.read(val)))
        return false;
    }

    return true;
  }

  preprocess(data, meta, parentKey) {
    // console.log("Shape.preprocess ENTRY", this.title, parentKey, meta, data);
    const upMeta = metaMix(meta, this.meta);

    const afterAt = (parentKey ?? "@").split("@")[1];

    function defaultGetter(_, data, _meta, key) {
      // console.log("default getter", data, key);
      const [beforeAt, afterAt] = key.split("@");
      if (!afterAt) {
        // console.log("default getter early exit", data, key);
        return data;
      }
      const [beforeDot, ...afterDot] = afterAt.split(".");
      const shouldLowKey = afterDot.length ? afterDot[afterDot.length - 1] : undefined;
      const lowKey = shouldLowKey ?? beforeDot ?? afterAt ?? beforeAt;
      // console.log("default getter final", data, key, data[lowKey]);
      return data[lowKey];
    }

    const [ beforeDot, ...lastDots] = afterAt.split(".");
    const shouldLastKey = lastDots.length ? lastDots[lastDots.length - 1] : undefined;
    const lastKey = shouldLastKey ?? (lastDots.length ? lastDots[lastDots.length - 2] : beforeDot);

    const gotten = lastDots.length && !lastDots[lastDots.length - 1] || !beforeDot
      ? data : (this.meta.getter ?? defaultGetter)(
        this,
        lastKey === beforeDot ? data : data[lastKey],
        upMeta,
        (parentKey ?? "@")
      );

    if (gotten === undefined)
      return this.meta.default;

    // const pKey = beforeAt && afterAt ? "" : (parentKey ?? "@");

    const ret = Object.entries(this.types).reduce((a, [key, type]) => {
      // console.log("Shape.preprocess item", this.title, data, key, type);
      const downMeta = metaMix(upMeta, type.meta);
      const downKey = (parentKey ?? "@") + (type.meta.from ?? key);
      const subGetter = this.meta.getter ?? type.meta.getter ?? defaultGetter;
      const subGotten = subGetter(type, gotten, downMeta, downKey);
      const value = type.preprocess(subGotten, downMeta, downKey + ".");

      if (value !== undefined)
        return ({
          ...a,
          [key]: value,
        });

      else
        return a;
    }, {});
    // console.log("Shape.preprocess final", this.title, data, upMeta, parentKey, ret);
    return ret;
  }

  diff(value, previous) {
    if (value && !previous || !value && previous)
      return true;

    if (!value && !previous)
      return false;

    const rvalue = value ?? {};
    const rprevious = previous ?? {};

    for (let key in this.types)
      if (this.types[key].diff(rvalue[key], rprevious[key]))
        return true;

    return false;
  }

  onChange(value, previous) {
    // console.log("Shape.onChange", value, previous);
    super.onChange(value, previous);
    const rvalue = value ?? {};
    const rprevious = previous ?? {};
    Object.entries(this.types).forEach(([key, subType]) => {
      if (subType.diff(rvalue[key], rprevious[key]))
        subType.onChange(rvalue[key], rprevious[key]);
    });
  }

  recurse(key, meta) {
    if (this.meta.recurse)
      return this.types[this.meta.recurse].recurse(key, meta);
    return this.types[key]
  }
}

Shape.extend = function (types, map, declaration, options = {}) {
  return extend(Shape, [types, map, declaration], options);
};

export class Dictionary extends Bool {
  constructor(title, meta, map, SubType, subTypeArgs) {
    super(title, meta, map);
    this.SubType = SubType;
    this.subTypeArgs = subTypeArgs;
  }

  realRead(value, dataKey = []) {
    if (value === undefined)
      return undefined;

    if (dataKey.length) {
      const [ head, ...tail ] = dataKey;
      const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);
      return Object.keys(value).reduce((a, key) => dummy.realRead(value[key][head], tail) ?? a);
    }

    return value;
  }

  read(value) {
    if (value === undefined)
      return this.meta.naOk ? true : undefined;

    const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);

    for (const key of Object.keys(value))
      if (dummy.invalid(dummy.read(value[key])))
        return true;

    return false;
  }

  preprocess(data, meta, parentKey) {
    const mp = this.metaPreprocess(data, meta, parentKey);

    if (mp)
      return mp;

    if (!data)
      return;

    const upMeta = metaMix(meta, this.meta);
    const transformKeyOut = upMeta.transformKey?.out ?? (a => a);
    const dummy = new this.SubType("dummy", upMeta, ...this.subTypeArgs);

    return Object.entries(data).reduce((a, [key, iValue]) => {
      const rkey = transformKeyOut(key);

      return {
        ...a,
        [rkey]: dummy.preprocess(iValue, upMeta),
      };
    }, {});
  }

  diff(value, previous) {
    const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);

    if (value && !previous || !value && previous)
      return true;

    if (!value && !previous)
      return false;

    for (let key in value) {
      if (!previous[key] || dummy.diff(value[key], previous[key]))
        return true;
    }

    for (let key in previous)
      if (!value[key])
        return true;

    return false;
  }

  onChange(value, previous) {
    const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);
    super.onChange(value, previous);
    const rvalue = value ?? {};
    const rprevious = previous ?? {};
    Object.keys(rvalue).forEach(key => {
      if (dummy.diff(rvalue[key], rprevious[key]))
        dummy.onChange(rvalue[key], rprevious[key]);
    });
  }

  Label(props) {
    const { self, upMeta } = props;
    const subType = new self.SubType("dummy", metaMix(self.meta, upMeta), ...self.subTypeArgs);

    return (<>
      { EnumLabel(props) }

      <div key="subtype-title">{ subType.constructor.name }</div>

      { subType.Label({ ...props, self: subType }) }
    </>);
  }

  recurse(key, meta) {
    const upMeta = metaMix(meta, this.meta);
    return new this.SubType(upMeta.t(key), {}, ...this.subTypeArgs);
  }
}

Dictionary.extend = (map, SubType, subTypeArgs, options = {}) =>
  extend(Dictionary, [map, SubType, subTypeArgs], options);

export class DateTime extends Str {
  constructor(title, meta) {
    super(title, meta);
    this.initialFilter = {};
  }

  renderValue(value, _data, data, _index, _key, meta, _cast) {
    const upMeta = metaMix(meta, this.meta);
    if (value !== undefined)
      return this.format(value, meta, data);
    else
      return <Tooltip title={upMeta.naTooltip}>{upMeta.na.title}</Tooltip>;
  }

  format(value, _meta, _data) {
    switch (this.meta.format) {
    case "date":
      return value.toLocaleDateString();
    case "time":
      return value.toLocaleTimeString();
    default:
      return value.getDate() === (new Date()).getDate()
        ? value.toLocaleTimeString()
        : value.toLocaleString();
    }
  }

  invalid(value) {
    return value === undefined || Object.prototype.toString.call(value) !== "[object Date]" || isNaN(value);
  }

  filter(value, filterValue) {
    if (!(filterValue.end && filterValue.start))
      return true;

    else
      return value >= filterValue.start && value < filterValue.end;
  }

  Filter(props) {
    const { dataKey, type, value, onChange, cast } = props;
    const dateTimeFilterClass = cast.DateTime?.Filter ?? defaultCast.DateTime.Filter;

    return (<div data-testid={"filter-" + dataKey} className={dateTimeFilterClass}>
      <TextField
        label={"Start " + type.title}
        type="datetime-local"
        value={toDateTimeLocal(value.start)}
        onChange={e => onChange({
          start: new Date(e.target.value),
          end: value.end,
        })}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        label={"End " + type.title}
        type="datetime-local"
        value={toDateTimeLocal(value.end)}
        onChange={e => onChange({
          start: value.start,
          end: new Date(e.target.value),
        })}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </div>);
  }

  preprocess(data, meta, parentKey) {
    const ret = this.metaPreprocess(data, meta, parentKey) ?? data;

    if (!ret)
      return;

    return Math.floor(ret * this.meta.measure ?? 1);
  }
}

export class Fun extends Bool {
  constructor(title, meta, map) {
    super(title, meta, map);
    this.fun = null;
  }

  set(data) {
    this.data = data;
  }

  renderValue(value, _data, _index, _key, _meta, _cast) {
    return (<Button onClick={value}>
      { this.title }
    </Button>);
  }
}
