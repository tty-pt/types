import React from "react";
import PropTypes from "prop-types";
// import { Button, Toggle, Paper, IconButton, InputBase, Chip, TextField } from "@material-ui/core";
import { Paper, IconButton, InputBase, Chip, TextField } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { useCast } from "@tty-pt/styles";
import { enumCount } from "./utils";
import { Percent } from "./Percent";
import { Enum } from "./Enum";

export
function extend(DefaultType, passArgs, options) {
  const { BaseType = DefaultType } = options;

  const Type = options.makeType
    ? options.makeType(BaseType)
    : (class SpecificType extends BaseType {
      constructor(title, ...args) {
        super(title, ...passArgs, ...args);
      }
    });

  Object.assign(Type.prototype, options);

  return Type;
}

function dec2hex(dec) {
  return dec.toString(16).padStart(2, "0")
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
  const { type, value, onChange } = props;
  const c = useCast();

  return (
    <Paper className={c("horizontal0")}>
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
  onChange: PropTypes.func,
};

function Filter(props) {
  const { label, active, value, ...rest } = props;
  const c = useCast();

  return (<Chip
    label={`${label} (${value})`}
    className={c(active ? "chipActive" : "chip")}
    { ...rest }
  />);
}

Filter.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  active: PropTypes.bool,
};

export class IntegerType {
  constructor(title) {
    this.title = title;
    this.detailsTitle = title;
    this.mtType = "numeric";
  }

  read(value) {
    return value;
  }

  renderValue(value) {
    return this.read(value);
  }

  renderColumn(value) {
    return <TextCenter>{this.renderValue(value)}</TextCenter>;
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
}

export class StringType extends IntegerType {
  constructor(title) {
    super(title);
    this.initialFilter = "";
    this.mtType = "string";
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
    return Array.from(arr, dec2hex).join('');
  }
}

export class ComponentType extends StringType {
  constructor(title) {
    super(title);
    delete this.initialFilter;
    this.mtType = "numeric";
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
  constructor(title, icons) {
    super(title);
    this.icons = icons;
  }

  renderValue(value) {
    return <Percent icons={this.icons} level={this.read(value)} />
  }

  format(value) {
    return this.read(value) + "%";
  }

  invalid(value) {
    const rvalue = this.read(value);
    return isNaN(rvalue) || rvalue < 0 || rvalue > 100;
  }
}

PercentType.extend = function extendPercent(icons, options = {}) {
  return extend(PercentType, [icons], options);
};

export class EnumType extends ComponentType {
  constructor(title, declaration, map) {
    super(title);
    this.initialFilter = { };
    this.declaration = declaration;
    this.map = map;
  }

  renderValue(value) {
    return <Enum values={this.map} enumKey={this.read(value)} />;
  }

  mapped(value) {
    return this.map[this.read(value)];
  }

  format(value) {
    return this.mapped(value).title;
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
      <div className={c("horizontal0 flexWrap")}>
        { filtersEl }
      </div>
    );
  }

  invalid(value) {
    return isNaN(value) || value;
  }
}

EnumType.extend = function extendEnum(declaration, map, options = {}) {
  return extend(EnumType, [declaration, map], options);
};

export class BoolType extends EnumType {
  constructor(title, declaration, map, badState) {
    super(title, declaration, map);
    this.goodState = 0;
    this.badState = badState;
  }

  read(value) {
    return value ? this.badState : this.goodState;
  }
}

BoolType.extend = function extendBool(declaration, map, badState, options = {}) {
  return extend(BoolType, [declaration, map, badState], options);
}

export class RecurseBoolType extends BoolType {
  constructor(title, declaration, map, badState, types) {
    super(title, declaration, map, badState);
    this.types = types;
  }

  read(value) {
    const entries = Object.entries(value);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const [ key, value ] = entry;
      const type = this.types[key];
      if (type.invalid(value))
        return this.badState;
    }

    return this.goodState;
  }

  invalid(value) {
    return this.read(value) === this.badState;
  }
}

RecurseBoolType.extend = function extendRecurseBool(declaration, map, badState, types, options = {}) {
  return extend(RecurseBoolType, [declaration, map, badState, types], options);
}

export class DictionaryOfType extends BoolType {
  constructor(title, declaration, map, badState, SubType, subTypeArgs) {
    super(title, declaration, map, badState);
    this.SubType = SubType;
    this.subTypeArgs = subTypeArgs;
  }

  read(value) {
    const subType = new this.SubType("ignoreMe", ...this.subTypeArgs);
    const keys = Object.keys(value);

    for (let i = 0; i < keys.length; i++)
      if (subType.invalid(value[keys[i]]))
        return this.badState;

    return this.goodState;
  }

  invalid(value) {
    return this.read(value) === this.badState;
  }
}

DictionaryOfType.extend = (declaration, map, badState, SubType, options = {}) =>
  extend(DictionaryOfType, [declaration, map, badState, SubType], options);

// export class ButtonType extends ComponentType {
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

// export class ModalType extends ButtonType {
//   constructor(title, onClick, Modal) {
//     super(title, onClick);
//     this.Modal = Modal;
//   }
// }

// export class BaseToggleType extends ButtonType {
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

// export class ToggleType extends BaseToggleType {
//   constructor(title, onClick) {
//     super(title, onClick, Toggle);
//   }
// }

export class DateTimeType extends StringType {
  constructor(title) {
    super(title);
    this.initialFilter = {};
    this.mtType = "datetime";
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
    const { type, value, onChange } = props;
    const c = useCast();

    return (<Paper className={c("padSmall verticalSmall")}>
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
