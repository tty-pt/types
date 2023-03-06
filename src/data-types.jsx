import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
// import { Button, Toggle, Paper, IconButton, InputBase, Chip, TextField } from "@material-ui/core";
import { Button, Paper, IconButton, InputBase, Chip, TextField, Checkbox as CheckboxComponent } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { useCast } from "@tty-pt/styles";
import { enumCount } from "./utils";
import { Percent as PercentComponent } from "./Percent";
import { Enum as EnumComponent } from "./Enum";

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
  return ret;
}

function TextCenter(props) {
  const { children } = props;
  const c = useCast();

  return <div className={c("textAlignCenter")}>{children}</div>;
}

TextCenter.propTypes = {
  children: PropTypes.node,
};

function FHCenter(props) {
  const { children } = props;
  const c = useCast();

  return (<div className={c("horizontal0 justifyContentCenter")}>
    { children }
  </div>);
}

FHCenter.propTypes = {
  children: PropTypes.node,
};

function TextFilter(props) {
  const { dataKey, type, value, onChange } = props;
  const c = useCast();

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
};

function Filter(props) {
  const { chipKey, label, active, value, ...rest } = props;
  const c = useCast();

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
};

export class Integer {
  constructor(title, meta = {}) {
    this.title = title;
    this.meta = meta;
    this.detailsTitle = title;
  }

  read(value) {
    return value;
  }

  renderValue(value) {
    return this.read(value);
  }

  renderColumn(value, index, key) {
    return <TextCenter data-testid={"column-" + key}>{this.renderValue(value, index, key)}</TextCenter>;
  }

  format(value) {
    return "" + value;
  }

  invalid(value) {
    return value;
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

  preprocess(value) {
    return value;
  }

  initial() {
    return 1;
  }

  onChange(value) {
    if (this.meta.onChange)
      this.meta.onChange(value);
  }
}

export class String extends Integer {
  constructor(title, meta) {
    super(title, meta);
    this.initialFilter = "";
  }

  invalid(value) {
    return !value;
  }

  filter(value, filterValue) {
    return this.read(value).startsWith(filterValue);
  }

  mock() {
    const arr = new Uint8Array(20);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
  }

  initial() {
    return "";
  }
}

export class Component extends String {
  constructor(title, meta) {
    super(title, meta);
    delete this.initialFilter;
  }

  renderColumn(value, index, key) {
    return <FHCenter data-testid={"column-" + key}>{ this.renderValue(value, index, key) }</FHCenter>;
  }

  format(value) {
    return this.read(value);
  }

  invalid(value) {
    return this.read(value);
  }
}

export class Percent extends Component {
  constructor(title, meta, icons) {
    super(title, meta);
    this.icons = icons;
  }

  renderValue(value) {
    return <PercentComponent icons={this.icons} level={this.read(value)} />;
  }

  format(value) {
    return this.read(value) + "%";
  }

  invalid(value) {
    const rvalue = this.read(value);
    return isNaN(rvalue) || rvalue < 0 || rvalue > 100;
  }

  initial() {
    return 0;
  }
}

Percent.extend = function extendPercent(icons, options = {}) {
  return extend(Percent, [icons], options);
};

export class Enum extends Component {
  constructor(title, meta, declaration, map, error = 1) {
    super(title, meta);
    this.initialFilter = { };
    this.declaration = declaration;
    this.map = map;
    this.error = error;
  }

  renderValue(value) {
    return <EnumComponent values={this.map} enumKey={this.read(value)} />;
  }

  mapped(value) {
    return this.map[this.read(value)];
  }

  format(value, meta) {
    const upMeta = { ...meta, ...this.meta };
    return upMeta.t(this.mapped(value).title);
  }

  filter(value, filterValue) {
    if (!Object.keys(filterValue).length)
      return true;
    const rvalue = this.read(value);
    return filterValue[rvalue];
  }

  Filter(props) {
    const { type, value, onChange, dataKey, data } = props;
    const c = useCast();
    const numbers = enumCount(type.declaration, data, dataKey);

    const filtersEl = Object.values(type.declaration).map(key => (
      <Filter
        key={key}
        chipKey={dataKey + "-" + key}
        label={type.map[key].title}
        value={numbers[key]}
        active={value[key]}
        onClick={value[key] ? () => onChange(delKey(value, key)) : () => onChange({
          ...value,
          [key]: true,
        })}
      />
    ));

    return (
      <div data-testid={"filter-" + dataKey} className={c("horizontal0 flexWrap")}>
        { filtersEl }
      </div>
    );
  }

  invalid(value) {
    return isNaN(value) || value;
  }

  initial() {
    return this.error;
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

  read(value) {
    return !value;
  }

  initial() {
    return true;
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

  initial() {
    return false;
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

  read(value) {
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

  invalid(value) {
    return this.read(value);
  }

  initial(meta) {
    const upMeta = { ...meta, ...this.meta };

    return Object.entries(this.types).reduce((a, [key, type]) => ({
      ...a,
      [key]: type.initial(upMeta),
    }), {});
  }

  preprocess(value, meta) {
    const upMeta = { ...meta, ...this.meta };

    return Object.entries(this.types).reduce((a, [key, type]) => ({
      ...a,
      [key]: value[key] ? type.preprocess(value[key], upMeta) : type.initial(upMeta),
    }), {});
  }

  onChange(value) {
    super.onChange(value);
    Object.entries(this.types).forEach(([key, subType]) => subType.onChange(value[key]));
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

  read(value) {
    const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);
    const keys = Object.keys(value);

    for (let i = 0; i < keys.length; i++)
      if (dummy.invalid(value[keys[i]]))
        return true;

    return false;
  }

  invalid(value) {
    return this.read(value);
  }

  initial() {
    return {};
  }

  preprocess(value, meta) {
    const upMeta = { ...meta, ...this.meta };
    const dummy = new this.SubType("dummy", upMeta, ...this.subTypeArgs);

    return Object.entries(value).reduce((a, [key, iValue]) => {
      const rkey = upMeta.transformKey.out(key);

      return {
        ...a,
        [rkey]: dummy.preprocess(iValue, upMeta),
      };
    }, {});
  }

  onChange(value) {
    const dummy = new this.SubType("dummy", this.meta, ...this.subTypeArgs);

    super.onChange(value);
    Object.keys(value).forEach(key => dummy.onChange(value[key]));
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
    return Object.prototype.toString.call(value) !== "[object Date]" || isNaN(value);
  }

  filter(value, filterValue) {
    if (!(filterValue.end && filterValue.start))
      return true;

    else
      return value >= filterValue.start && value < filterValue.end;
  }

  Filter(props) {
    const { dataKey, type, value, onChange } = props;
    const c = useCast();

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

  initial() {
    return () => {};
  }
}
