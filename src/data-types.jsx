import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tooltip, Button, Paper, IconButton, InputBase, Chip, TextField, Checkbox as CheckboxComponent, MenuItem } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CancelIcon from "@material-ui/icons/Cancel";
import { useCast, MagicContext } from "@tty-pt/styles";
import { mapCount } from "./utils";
import { Percent as PercentComponent } from "./Percent";
import { Enum as EnumComponent } from "./Enum";

const defaultMeta = {
  na: {
    title: "N/A",
    color: "Black",
    Icon: CancelIcon,
  },
  naTooltip: "Not Available",
};

function metaMix(a, b) {
  const c = { ...a };
  delete c.getter;
  delete c.subGetter;
  return { ...defaultMeta, ...c, ...b };
  // return { ...a, ...b };
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
  const { children, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  return <div className={c("textAlignCenter")}>{children}</div>;
}

TextCenter.propTypes = {
  children: PropTypes.node,
  dependencies: PropTypes.object,
};

function FHCenter(props) {
  const { children, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  return (<div className={c("horizontal0 justifyContentCenter")}>
    { children }
  </div>);
}

FHCenter.propTypes = {
  children: PropTypes.node,
  dependencies: PropTypes.object,
};

function TextFilter(props) {
  const { dataKey, type, value, onChange, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  return (
    <Paper data-testid={"filter-" + dataKey} className={c("horizontal0")}>
      <IconButton aria-label={type.title}>
        <SearchIcon />
      </IconButton>

      <InputBase
        value={value}
        placeholder={type.title}
        inputProps={{ "aria-label": type.title }}
        onChange={e => onChange(e.target.value)}
      />
    </Paper>
  );
}

TextFilter.propTypes = {
  type: PropTypes.any,
  value: PropTypes.string,
  dataKey: PropTypes.string,
  onChange: PropTypes.func,
  dependencies: PropTypes.object,
};

export
function Filter(props) {
  const { chipKey, label, active, value, dependencies, ...rest } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  return (<Chip
    data-testid={"chip-" + chipKey}
    label={`${label} (${value})`}
    className={c(active ? "chipActive" : "chip")}
    { ...rest }
  />);
}

Filter.propTypes = {
  label: PropTypes.string,
  chipKey: PropTypes.string,
  value: PropTypes.any,
  active: PropTypes.bool,
  dependencies: PropTypes.object,
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

  renderValue(value, _index, _key, meta) {
    const upMeta = metaMix(meta, this.meta);
    const rvalue = this.read(value);
    if (rvalue !== undefined)
      return rvalue;
    else
      return <Tooltip title={upMeta.naTooltip}>{upMeta.na.title}</Tooltip>;
  }

  renderColumn(value, index, key, meta) {
    return <TextCenter
      dependencies={meta.dependencies}
      data-testid={"column-" + key}
    >
      {this.renderValue(value, index, key, meta)}
    </TextCenter>;
  }

  format(value) {
    return "" + value;
  }

  invalid(value) {
    return value === undefined || this.read(value);
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

  metaPreprocess(data, meta) {
    if (!(this.meta.getter && this.meta.if && this.meta.if(this, data, meta)))
      return;

    return this.meta.getter(this, data, meta);
  }

  preprocess(data, meta) {
    return this.metaPreprocess(data, meta) ?? data;
  }

  metaInitial(meta, data) {
    if (this.meta.default && !(this.meta.if && this.meta.if(this, data)))
      return this.meta.default;
  }

  initial(meta, data) {
    return this.metaInitial(meta, data);
  }

  diff(value, previous) {
    return value !== previous;
  }

  onChange(value /*, previous */) {
    if (this.meta.onChange)
      this.meta.onChange(value);
  }

  detailsTooltip(value, meta) {
    return value === undefined ? metaMix(meta, this.meta).naTooltip : this.format(value, meta);
  }
}

export class String extends Integer {
  constructor(title, meta) {
    super(title, meta);
    this.initialFilter = "";
  }

  invalid(value) {
    return value === undefined || !this.read(value);
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

export class Component extends String {
  constructor(title, meta) {
    super(title, meta);
    delete this.initialFilter;
  }

  renderColumn(value, index, key, meta) {
    return <FHCenter
      dependencies={meta.dependencies}
      data-testid={"column-" + key}
    >
      { this.renderValue(value, index, key, meta) }
    </FHCenter>;
  }

  format(value) {
    return this.read(value);
  }
}

export class Percent extends Component {
  constructor(title, meta, icons) {
    super(title, meta);
    this.icons = icons;
  }

  renderValue(value, _index, _key, meta) {
    const upMeta = metaMix(meta, this.meta);
    const rvalue = this.read(value);
    if (!rvalue)
      return <EnumComponent
        values={{ [undefined]: upMeta.na }}
        enumKey={undefined}
        tooltip={upMeta.naTooltip}
      />;

    return <PercentComponent icons={this.icons} level={rvalue} />;
  }

  format(value) {
    return this.read(value) + "%";
  }

  invalid(value) {
    if (value === undefined)
      return true;
    const rvalue = this.read(value);
    return isNaN(rvalue) || rvalue < 0 || rvalue > 100;
  }
}

Percent.extend = function extendPercent(icons, options = {}) {
  return extend(Percent, [icons], options);
};

export class Enum extends Component {
  constructor(title, meta, declaration, map) {
    super(title, meta);
    this.initialFilter = null;
    this.declaration = declaration;
    this.map = map;
  }

  renderValue(value, _index, _key, meta) {
    const upMeta = metaMix(meta, this.meta);
    const rvalue = this.read(value);
    if (rvalue === undefined)
      return <EnumComponent
        values={{ [undefined]: upMeta.na }}
        enumKey={undefined}
        tooltip={upMeta.naTooltip}
      />;

    return <EnumComponent values={this.map} enumKey={rvalue} />;
  }

  mapped(value, meta) {
    const upMeta = metaMix(meta, this.meta);
    return this.map[this.read(value)] ?? upMeta.na;
  }

  format(value, meta) {
    const upMeta = metaMix(meta, this.meta);
    return upMeta.t(this.mapped(value, meta).title);
  }

  filter(value, filterValue) {
    if (filterValue === null)
      return true;

    const rvalue = this.read(value);
    return filterValue[rvalue];
  }

  Filter(props) {
    const { type, superType, value, onChange, dataKey, data, dependencies } = props;
    const c = useCast(dependencies?.MagicContext ?? MagicContext);
    const numbers = mapCount(superType, data, dataKey);

    const filtersEl = Object.values(type.declaration).map(key => {
      return (<Filter
        key={key}
        chipKey={dataKey + "-" + key}
        label={type.map[key].title}
        value={numbers[key] ?? 0}
        active={value ? value[key] : false}
        onClick={value?.[key] ? () => onChange(delKey(value, key)) : () => onChange({
          ...(value ?? {}),
          [key]: true,
        })}
        dependencies={dependencies}
      />);
    });

    return (
      <div data-testid={"filter-" + dataKey} className={c("horizontalSmall alignItemsCenter justifyContentSpaceBetween flexWrap")}>
        <div>{type.title}</div>
        <div className={c("horizontal0 flexWrap")}>{ filtersEl }</div>
      </div>
    );
  }

  invalid(value) {
    if (value === undefined)
      return true;
    const rvalue = this.read(value);
    return isNaN(rvalue) || rvalue;
  }
}

Enum.extend = function extendEnum(declaration, map, options = {}) {
  return extend(Enum, [declaration, map], options);
};

export class Bool extends Enum {
  constructor(title, meta, map) {
    super(title, meta, {
      OK: false,
      ERROR: true,
    }, map);
  }

  filter(value, filterValue) {
    if (filterValue === null)
      return true;

    const rvalue = this.realRead(value);

    if (filterValue === "undefined")
      return value === undefined;

    return rvalue === filterValue;
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
        mapped: true,
        label: "true (" + (numbers[true] ?? 0) + ")",
      },
      2: {
        value: 2,
        mapped: false,
        label: "false (" + (numbers[false] ?? 0) + ")",
      },
      3: { // only show undefined values
        value: 3,
        mapped: "undefined",
        label: "unset (" + (numbers[undefined] ?? 0) + ")",
      },
    };

    const reverseMap = { [null]: 0, [true]: 1, [false]: 2, ["undefined"]: 3 };
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
  const { name, index, rvalue } = props;
  const [ checked, setChecked ] = useState(rvalue);

  useEffect(() => {
    setChecked(rvalue);
  }, [rvalue]);

  return (<CheckboxComponent
    name={name + "_" + index}
    checked={checked}
    onChange={() => setChecked(!checked)}
  />);
}

InnerCheckbox.propTypes = {
  name: PropTypes.string,
  index: PropTypes.number,
  rvalue: PropTypes.bool,
};

export class Checkbox extends Bool {
  constructor(title, meta, map) {
    super(title, meta, map);
  }

  read(value) {
    return value;
  }

  renderValue(value, index, key) {
    return (<InnerCheckbox
      name={key}
      index={index}
      rvalue={this.read(value)}
    />);
  }
}

export class RecurseBool extends Bool {
  constructor(title, meta, map, types) {
    super(title, meta, map);
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
      return;

    const entries = Object.entries(value);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const [ key, value ] = entry;
      const type = this.types[key];
      if (type.invalid(value))
        return false;
    }

    return true;
  }

  invalid(value) {
    return value === undefined || this.read(value);
  }

  initial(meta, data) {
    const mi = this.metaInitial(meta, data);

    if (mi)
      return mi;

    const upMeta = metaMix(meta, this.meta);

    return Object.entries(this.types).reduce((a, [key, type]) => ({
      ...a,
      [key]: type.initial(upMeta, data),
    }), {});
  }

  preprocess(data, meta, parentKey) {
    // console.log("RecurseBool.preprocess ENTRY", this.title, parentKey, meta, data, this.meta.getter);

    if (this.meta.if && !this.meta.if(this, data, meta)) {
      // console.log("RecurseBool.preprocess rejected", this.title, parentKey, meta, data);
      return;
    }

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

    if (!gotten) {
      // const ret = this.initial(meta, data);
      // console.log("RecurseBool.preprocess not gotten", this.title, parentKey, data, upMeta, ret);
      // return ret;
      return this.meta.default;
    }

    // const pKey = beforeAt && afterAt ? "" : (parentKey ?? "@");

    const ret = Object.entries(this.types).reduce((a, [key, type]) => {
      // console.log("RecurseBool.preprocess item", this.title, data, key, type);
      const downMeta = metaMix(upMeta, type.meta);
      const downKey = (parentKey ?? "@") + (type.meta.from ?? key);
      const subGetter = this.meta.getter ?? type.meta.getter ?? defaultGetter;
      const subGotten = subGetter(type, gotten, downMeta, downKey);
      const value = type.preprocess(subGotten, downMeta, downKey + ".");

      if (value)
        return ({
          ...a,
          [key]: value,
        });

      else
        return a;
    }, {});
    // console.log("RecurseBool.preprocess final", this.title, data, upMeta, parentKey, ret);
    return ret;
  }

  diff(value, previous) {
    if (value && !previous || !value)
      return true;

    for (let key in this.types)
      if (this.types[key].diff(value[key], previous[key]))
        return true;

    return false;
  }

  onChange(value, previous) {
    // console.log("RecurseBool.onChange", value, previous);
    super.onChange(value, previous);
    const rvalue = value ?? {};
    const rprevious = previous ?? {};
    Object.entries(this.types).forEach(([key, subType]) => {
      if (subType.diff(rvalue[key], rprevious[key]))
        subType.onChange(rvalue[key], rprevious[key]);
    });
  }
}

RecurseBool.extend = function extendRecurseBool(map, types, options = {}) {
  return extend(RecurseBool, [map, types], options);
};

export class DictionaryOf extends Bool {
  constructor(title, meta, map, SubType, subTypeArgs) {
    super(title, meta, map);
    this.SubType = SubType;
    this.subTypeArgs = subTypeArgs;
  }

  realRead(value, dataKey = []) {
    if (!value)
      return undefined;

    if (dataKey.length) {
      const [ head, ...tail ] = dataKey;
      const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);
      return Object.keys(value).reduce((a, key) => dummy.realRead(value[key][head], tail) ?? a);
    }

    return value === undefined ? undefined : true;
  }

  read(value) {
    if (value === undefined)
      return;

    const keys = Object.keys(value);

    const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);
    for (let i = 0; i < keys.length; i++)
      if (dummy.invalid(value[keys[i]]))
        return false;

    return true;
  }

  invalid(value) {
    return value === undefined || this.read(value);
  }

  preprocess(data, meta) {
    const mp = this.metaPreprocess(data, meta);

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
    Object.keys(value).forEach(key => {
      if (dummy.diff(value[key], previous[key]))
        dummy.onChange(value[key], previous[key]);
    });
  }
}

DictionaryOf.extend = (map, SubType, subTypeArgs, options = {}) =>
  extend(DictionaryOf, [map, SubType, subTypeArgs], options);

// export class Button extends Component {
//   constructor(title, onClick) {
//     super(title, null);
//     this.onClick = onClick;
//   }

//   renderValue() {
//     return (<Button onClick={this.onClick}>
//       { this.title }
//     </Button>);
//   }
// }

// export class Modal extends Button {
//   constructor(title, onClick, Modal) {
//     super(title, onClick);
//     this.Modal = Modal;
//   }
// }

// export class BaseToggle extends Button {
//   constructor(title, onClick, Toggle) {
//     super(title, onClick);
//     this.Toggle = Toggle;
//   }

//   renderValue(value) {
//     const Toggle = this.Toggle;

//     return (<div>
//       { this.title }
//       <Toggle onToggle={this.onClick} toggle={this.read(value)} />
//     </div>);
//   }
// }

// export class Toggle extends BaseToggle {
//   constructor(title, onClick) {
//     super(title, onClick, Toggle);
//   }
// }

export class DateTime extends String {
  constructor(title, meta) {
    super(title, meta);
    this.initialFilter = {};
  }

  read(value) {
    return toDateTimeLocal(value);
  }

  invalid(value) {
    if (value === undefined)
      return true;
    const rvalue = this.read(value);
    return Object.prototype.toString.call(rvalue) !== "[object Date]" || isNaN(rvalue);
  }

  filter(value, filterValue) {
    if (!(filterValue.end && filterValue.start))
      return true;

    else
      return value >= filterValue.start && value < filterValue.end;
  }

  Filter(props) {
    const { dataKey, type, value, onChange, dependencies } = props;
    const c = useCast(dependencies?.MagicContext ?? MagicContext);

    return (<Paper data-testid={"filter-" + dataKey} className={c("padSmall verticalSmall")}>
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
    </Paper>);
  }

  preprocess(data, meta) {
    const ret = this.metaPreprocess(data, meta) ?? data;

    if (!ret)
      return;

    return ret * (this.meta.measure ?? 1);
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

  renderValue(value) {
    return (<Button onClick={value}>
      { this.title }
    </Button>);
  }
}
