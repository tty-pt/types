import React from "react";
import PropTypes from "prop-types";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import defaultCast from "./defaultCast";

export
function StringFilter(props) {
  const { dataKey, title, value, onChange, cast } = props;
  const stringFilterClass = cast.Str?.Filter ?? defaultCast.Str.Filter;

  return (<div data-testid={"filter-" + dataKey} className={stringFilterClass}>
    <IconButton aria-label={title}>
      <SearchIcon />
    </IconButton>

    <InputBase
      value={value}
      placeholder={title}
      inputProps={{ "aria-label": title }}
      onChange={e => onChange(e.target.value)}
    />
  </div>);
}

StringFilter.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  dataKey: PropTypes.string,
  onChange: PropTypes.func,
  cast: PropTypes.object,
};
