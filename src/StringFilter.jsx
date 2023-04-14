import React from "react";
import PropTypes from "prop-types";
import { useCast, MagicContext } from "@tty-pt/styles";
import SearchIcon from "@material-ui/icons/Search";
import { Paper, IconButton, InputBase } from "@material-ui/core";

export
function StringFilter(props) {
  const { dataKey, title, value, onChange, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  return (<Paper data-testid={"filter-" + dataKey} className={c("horizontal0")}>
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
  dependencies: PropTypes.object,
};
