import React, { useState } from "react";
import PropTypes from "prop-types";
import MyPropTypes from "./prop-types";
import { Paper } from "@material-ui/core";
import MaybeTip from "./MaybeTip";
import { useCast, MagicContext } from "@tty-pt/styles";
import useFilters from "./useFilters";
import IconButton from "./IconButton";

const defaultTableCast = "tableLayoutFixed sizeHorizontalFull";
const defaultContainerCast = "marginLeftSmall borderTopDivider " + defaultTableCast;
const defaultHeaderCast = "horizontalSmall alignItemsCenter";
const defaultInvalidCast = "colorErrorLight";
const defaultTitleCast = "fontWeightBold";
const defaultDetailsCast = "pad horizontal flexWrap flexGrowChildren";
const defaultDetailCast = "overflowHidden " + defaultTableCast;
const lineCast = "borderTopDivider";
const defaultThCast = "textOverflowEllipsis overflowHidden";

export function titleCamelCase(camelCase) {
  const almost = camelCase.replace(/([A-Z])/g, function (g) { return " " + g; });
  return almost.charAt(0).toUpperCase() + almost.substr(1);
}

function Details(props) {
  const {
    rowData, type, details, cast = {}, index,
    meta: detailsMeta, dependencies,
    titleFormat = title => title + ": ", renderValue,
    components = {}, table,
  } = props;

  const { Tooltip = MaybeTip } = components;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);
  const containerClass = c(cast.container ?? defaultContainerCast);
  const headerClass = c(cast.header ?? defaultHeaderCast);
  const titleClass = c(cast.title ?? defaultTitleCast);
  const invalidClass = c(cast.invalid ?? defaultInvalidCast);
  const detailClass = c(cast.detail ?? defaultDetailCast);

  const maybeTableMap = {
    [true]: (field, value, pType, subType, meta) => {
      const upMeta = { ...meta, ...pType.meta };

      function renderRecurse(getSubInstance) {
        return (<tr key={field + "-children"}>
          <td colSpan="2">
            <table className={containerClass}>
              <tbody>
                {
                  Object.keys(value)
                    .map(key => mapDetails(key, value[key], subType, getSubInstance(key), upMeta))
                }
              </tbody>
            </table>
          </td>
        </tr>);
      }

      const recurseEl = value ? (subType.types ? (
        renderRecurse(key => subType.types[key])
      ) : subType.SubType ? (
        renderRecurse(key => new subType.SubType(meta.t(key), {}, ...subType.subTypeArgs))
      ) : null) : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, tooltip, children, cellClass } = props;

        return (<>
          <tr key={field}>
            <td className={headerClass}>
              { renderValue ? <span>{ subType.renderValue(value, index, field, upMeta) }</span> : null }
              <span className={titleClass}>
                {
                  titleFormat(meta.t(pType.SubType
                    ? titleCamelCase(field)
                    : subType.detailsTitle
                  ))
                }
              </span>
            </td>
            <td className={cellClass}>
              <Tooltip tooltip={tooltip} dependencies={dependencies}>{ children }</Tooltip>
            </td>
          </tr>
          { recurseEl }
        </>);
      }

      Component.propTypes = {
        tooltip: PropTypes.string,
        children: PropTypes.node,
        value: PropTypes.any,
        cellClass: PropTypes.string,
      };

      return Component;
    },
    [false]: (field, value, pType, subType, meta) => {
      const upMeta = { ...meta, ...pType.meta };

      function renderRecurse(getSubInstance) {
        return (<div className={containerClass} key={field + "-children"}>
          {
            Object.keys(value)
              .map(key => mapDetails(key, value[key], subType, getSubInstance(key), upMeta))
          }
        </div>);
      }

      const recurseEl = value ? (subType.types ? (
        renderRecurse(key => subType.types[key])
      ) : subType.SubType ? (
        renderRecurse(key => new subType.SubType(meta.t(key), {}, ...subType.subTypeArgs))
      ) : null) : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, tooltip, children, cellClass } = props;

        return (<>
          <div key={field} className={headerClass}>
            { renderValue ? <span>{ subType.renderValue(value, index, field, upMeta) }</span> : null }
            <span className={titleClass}>
              {
                titleFormat(meta.t(pType.SubType
                  ? titleCamelCase(field)
                  : subType.detailsTitle
                ))
              }
            </span>
            <span className={cellClass}>
              <Tooltip tooltip={tooltip}>{ children }</Tooltip>
            </span>
          </div>
          { recurseEl }
        </>);
      }

      Component.propTypes = {
        value: PropTypes.any,
        tooltip: PropTypes.string,
        children: PropTypes.node,
        cellClass: PropTypes.string,
      };

      return Component;
    },
  };

  const boolTable = !!table;

  function mapDetails(field, value, type, subType, meta) {
    const isInvalid = subType.invalid(value);
    const cellClass = isInvalid ? invalidClass : "";
    const Component = maybeTableMap[boolTable](field, value, type, subType, meta);

    return (<Component
      cellClass={cellClass}
      value={value}
      tooltip={subType.detailsTooltip(value, meta)}
      key={field}
    >
      { subType.format(value, meta) }
    </Component>);
  }

  const detailsEl = details.map(key => mapDetails(key, rowData[key], type, type.types[key], detailsMeta));

  if (table)
    return (<table className={detailClass}>
      <tbody>
        { detailsEl }
      </tbody>
    </table>);
  else
    return <div className={detailClass}>{detailsEl}</div>;
}

Details.propTypes = {
  rowData: PropTypes.object,
  details: PropTypes.arrayOf(PropTypes.string),
  meta: PropTypes.shape({
    t: PropTypes.func.isRequired,
  }),
  type: PropTypes.any.isRequired,
  config: PropTypes.object,
  index: MyPropTypes.integer.isRequired,
  dependencies: PropTypes.object,
  cast: PropTypes.object,
  titleFormat: PropTypes.func,
  renderValue: PropTypes.bool,
  table: PropTypes.bool,
  components: PropTypes.object,
};

function DetailsPanel(props) {
  const {
    details = [], type, rowData = {},
    index, meta, dependencies, components,
    titleFormat, renderValue, cast = {}, table,
  } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  function renderDetails(key, rowData, details) {
    return (<Details
      key={key}
      details={details}
      rowData={rowData}
      type={type}
      index={index}
      meta={meta}
      components={components}
      dependencies={dependencies}
      titleFormat={titleFormat}
      renderValue={renderValue}
      cast={cast}
      table={table}
    />);
  }

  return (<div className={c(cast.details ?? defaultDetailsCast)}>
    { details.map((detail, idx) => renderDetails(idx, rowData, detail)) }
  </div>);
}

DetailsPanel.propTypes = {
  details: PropTypes.array.isRequired,
  components: PropTypes.object,
  titleFormat: PropTypes.func,
  renderValue: PropTypes.bool,
  rowData: PropTypes.object.isRequired,
  meta: PropTypes.shape({
    t: PropTypes.func.isRequired,
  }),
  type: PropTypes.any.isRequired,
  index: MyPropTypes.integer.isRequired,
  dependencies: PropTypes.object,
  cast: PropTypes.object,
  table: PropTypes.bool,
};

function Line(props) {
  const { data, index, type, className, columns, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);
  const colClass = c("pad") + " " + className;

  const columnsEl = columns.map(key => (
    <td className={colClass} key={key}>
      { type.types[key].renderColumn(data[key], index, key, type.meta) }
    </td>
  ));

  return (<tr data-testid={"row-" + index}>{columnsEl}</tr>);
}

Line.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  type: PropTypes.any.isRequired,
  columns: PropTypes.array.isRequired,
  className: PropTypes.string,
  dependencies: PropTypes.object,
};

function ExpandLine(props) {
  const { data, index, type, className, icons, detailPanel, columns, dependencies } = props;
  const [ open, setOpen ] = useState(false);
  const c = useCast(dependencies?.MagicContext ?? MagicContext);
  const colClass = c("pad") + " " + className;

  const columnsEl = [(
    <td key="expand" className={colClass}>
      <IconButton
        data-testid="expand"
        iconClassName={open ? c("rotatePiOverTwo") : ""}
        Component={icons.DetailPanel}
        onClick={() => setOpen(!open)}
      />
    </td>
  )].concat(columns.map(key => (
    <td key={key} className={colClass}>
      { type.types[key].renderColumn(data[key], index, key, type.meta) }
    </td>
  )));

  if (open)
    return (<>
      <tr data-testid={"row-" + index}>{columnsEl}</tr>
      <tr data-testid={"details-" + index}><td className={className} colSpan={columnsEl.length}>{detailPanel(data, index)}</td></tr>
    </>);

  else
    return <tr>{columnsEl}</tr>;
}

ExpandLine.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  type: PropTypes.any.isRequired,
  className: PropTypes.string,
  icons: PropTypes.object.isRequired,
  detailPanel: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  dependencies: PropTypes.object,
};

const horizontalCenterCast = "horizontal flexWrap alignItemsCenter";

function DefaultToolbar(props) {
  const { title, children, dependencies } = props;
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  return (<div className={c(horizontalCenterCast + " justifyContentSpaceBetween")}>
    <span className={c("h5")}>{ title }</span>
    <div className={c(horizontalCenterCast + " justifyContentEnd")}>
      { children }
    </div>
  </div>);
}

DefaultToolbar.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  dependencies: PropTypes.object,
};

export default function Table(props) {
  const {
    title = "", name = "table", data, type,
    columns = [], filters = [], details = [],
    icons, components = {}, t, cast = {}, dependencies,
    renderValue, titleFormat, detailsTable, global,
  } = props;
  const thCast = cast.th ?? defaultThCast;
  const tableCast = cast.table ?? defaultTableCast;
  const { Toolbar = DefaultToolbar } = components;
  const { filtersEl, filteredData } = useFilters({ data, type, config: filters, dependencies, global });
  const upMeta = {
    t: t ?? (a => a),
    ...type.meta,
  };
  const c = useCast(dependencies?.MagicContext ?? MagicContext);

  const div = details.length;

  const detailPanel = div ? function detailPanel(rowData, index) {
    return (<DetailsPanel
      details={details}
      type={type}
      rowData={rowData}
      index={index}
      meta={upMeta}
      dependencies={dependencies}
      components={components}
      cast={cast.details}
      titleFormat={titleFormat}
      renderValue={renderValue}
      table={detailsTable}
    />);
  } : null;

  const thClass = c(thCast + " pad");

  const headEl = (detailPanel ? [<th key="expand"></th>] : []).concat(
    // TODO support recursive type columns aka "robot.name"
    columns.map(key => (
      <th key={key} className={thClass}>{ upMeta.t(type.types[key].title) }</th>
    ))
  );

  const lineClass = c(lineCast);
  const LineComponent = detailPanel ? ExpandLine : Line;

  const linesEl = filteredData.map((rowData, index) => (
    <LineComponent
      key={index}
      index={index}
      data={rowData}
      type={type}
      icons={icons}
      detailPanel={detailPanel}
      className={lineClass}
      columns={columns}
    />
  ));

  return (<>
    <Toolbar title={title} data={data}>
      { filtersEl }
    </Toolbar>

    <Paper className={"typed " + c("overflowAuto")}>
      <table className={c(tableCast)}>
        <thead>
          <tr>{ headEl }</tr>
        </thead>
        <tbody className={c("borderTopDivider")}>
          { linesEl }
        </tbody>
      </table>
    </Paper>
    <input type="hidden" data-hidden-type="json" name={name + "_n"} value={data.length} />
  </>);
}

Table.Toolbar = DefaultToolbar;

Table.propTypes = {
  columns: PropTypes.array,
  filters: PropTypes.array,
  data: PropTypes.array,
  icons: PropTypes.object,
  details: PropTypes.array,
  t: PropTypes.func,
  type: PropTypes.any.isRequired,
  title: PropTypes.string,
  name: PropTypes.string,
  dependencies: PropTypes.object,
  components: PropTypes.object,
  cast: PropTypes.object,
  renderValue: PropTypes.bool,
  titleFormat: PropTypes.func,
  detailsTable: PropTypes.bool,
  global: PropTypes.object,
};
