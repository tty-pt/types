import React from "react";
import PropTypes from "prop-types";
import componentsSub from "./componentsSub";
import defaultCast from "./defaultCast";

export
function StringFilter(props) {
  const { dataKey, title, value, onChange, cast } = props;
  const stringFilterClass = cast.Str?.Filter ?? defaultCast.Str.Filter;
  const { Paper, SearchIcon, IconButton, InputBase } = componentsSub.use();

  return (<Paper data-testid={"filter-" + dataKey} className={stringFilterClass}>
    <IconButton aria-label={title}>
      <SearchIcon />
    </IconButton>

    <InputBase
      value={value}
      placeholder={title}
      inputProps={{ "aria-label": title }}
      onChange={e => onChange(e.target.value)}
    />
  </Paper>);
}

StringFilter.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  dataKey: PropTypes.string,
  onChange: PropTypes.func,
  cast: PropTypes.object,
};
