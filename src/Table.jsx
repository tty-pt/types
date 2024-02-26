import React, { useState } from "react";
import PropTypes from "prop-types";
import MyPropTypes from "./prop-types";
import MaybeTip from "./MaybeTip";
import useFilters from "./useFilters";
import IconButton from "./IconButton";
import defaultCast from "./defaultCast";

export function titleCamelCase(camelCase) {
  const almost = camelCase.replace(/([A-Z])/g, function (g) { return " " + g; });
  return almost.charAt(0).toUpperCase() + almost.substr(1);
}

function Details(props) {
  const {
    rowData, type, details, cast = {}, index, meta: detailsMeta,
    titleFormat, renderValue, components = {}, table,
  } = props;

  const { Tooltip = MaybeTip } = components;
  const detailsContainerClass = cast.Details?.container ?? defaultCast.Details.container;
  const detailsHeaderClass = cast.Details?.header ?? defaultCast.Details.header;
  const titleClass = cast.Details?.title ?? defaultCast.Details.title;
  const invalidClass = cast.invalid ?? defaultCast.invalid;
  const detailsColumnClass = cast.Details?.column ?? defaultCast.Details.column;
  const tooltipRootClass = cast.Tooltip?.root ?? defaultCast.Tooltip.root;
  const labelTitleClass = cast.Label?.title ?? defaultCast.Label.title;

  const maybeTableMap = {
    [true]: (field, value, pType, subType, meta) => {
      const upMeta = { ...meta, ...pType.meta };

      function renderRecurse() {
        const obj = subType.meta?.recurse ? value[subType.meta.recurse] : value;

        return (<tr key={field + "-children"}>
          <td colSpan="2">
            <table className={detailsContainerClass}>
              <tbody>
                {
                  typeof Object.keys(typeof obj === "object" ? obj : {})
                    .map(key => mapDetails(key, subType.meta.recurse ? value[subType.meta.recurse][key] : value[key], subType, subType.recurse(key, upMeta), upMeta))
                }
              </tbody>
            </table>
          </td>
        </tr>);
      }

      const recurseEl = value && subType.meta.recurse !== undefined ? renderRecurse() : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, cellClass } = props;
        const Label = subType.Label;
        const read = subType.read(value);
        const tooltip = subType.detailsTooltip(read, value, upMeta);

        return (<>
          <tr key={field}>
            <td className={detailsHeaderClass}>
              { renderValue ? <span>{ subType.renderValue(subType.read(value), value, index, field, upMeta, cast) }</span> : null }
              <span className={titleClass}>
                <Tooltip cast={cast} tooltip={<div className={tooltipRootClass}>
                    <div className={labelTitleClass}>{ subType.label ?? subType.constructor.name }</div>
                    <Label self={subType} upMeta={upMeta} index={index} enumKey={field} cast={cast} />
                </div>}>{
                titleFormat(meta.t(pType.SubType
                  ? titleCamelCase(field)
                  : subType.detailsTitle
                ))
                }</Tooltip>
              </span>
            </td>
            <td className={cellClass}>
              <Tooltip cast={cast} tooltip={tooltip}>{ subType.format(read, upMeta, value) }</Tooltip>
            </td>
          </tr>
          { recurseEl }
        </>);
      }

      Component.propTypes = {
        tooltip: PropTypes.string,
        value: PropTypes.any,
        cellClass: PropTypes.string,
      };

      return Component;
    },
    [false]: (field, value, pType, subType, meta) => {
      const upMeta = { ...meta, ...pType.meta };

      function renderRecurse() {
        const obj = subType.meta?.recurse ? value[subType.meta.recurse] : value;

        return (<div className={detailsContainerClass} key={field + "-children"}>
          {
            Object.keys(typeof obj === "object" ? obj : {})
              .map(key => mapDetails(key, subType.meta.recurse ? value[subType.meta.recurse][key] : value[key], subType, subType.recurse(key, upMeta), upMeta))
          }
        </div>);
      }

      const recurseEl = value && subType.meta.recurse !== undefined ? renderRecurse() : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, cellClass } = props;
        const Label = subType.Label;
        const read = subType.read(value);
        const tooltip = subType.detailsTooltip(read, value, upMeta);

        return (<>
          <div key={field} className={detailsHeaderClass}>
            { renderValue ? <span>{ subType.renderValue(subType.read(value), value, index, field, upMeta, cast) }</span> : null }
            <span className={titleClass}>
              <Tooltip cast={cast} tooltip={<div className={tooltipRootClass}>
                  <div className={labelTitleClass}>{ subType.label ?? subType.constructor.name }</div>
                  <Label self={subType} upMeta={upMeta} index={index} enumKey={field} cast={cast} />
              </div>}>{
              titleFormat(meta.t(pType.SubType
                ? titleCamelCase(field)
                : subType.detailsTitle
              ))
              }</Tooltip>
            </span>
            <span className={cellClass}>
              <Tooltip cast={cast} tooltip={tooltip}>{ subType.format(read, upMeta, value) }</Tooltip>
            </span>
          </div>
          { recurseEl }
        </>);
      }

      Component.propTypes = {
        value: PropTypes.any,
        tooltip: PropTypes.string,
        cellClass: PropTypes.string,
      };

      return Component;
    },
  };

  const boolTable = !!table;

  function mapDetails(field, value, type, subType, meta) {
    const read = subType.read(value, meta);
    const isInvalid = subType.invalid(read);
    const cellClass = isInvalid ? invalidClass : "";
    const Component = maybeTableMap[boolTable](field, value, type, subType, meta);

    return (<Component
      cellClass={cellClass}
      value={value}
      key={field}
    />);
  }

  const detailsEl = details.map(key => mapDetails(key, rowData[key], type, type.types[key], detailsMeta));

  if (table)
    return (<table className={detailsColumnClass}>
      <tbody>
        { detailsEl }
      </tbody>
    </table>);
  else
    return <div className={detailsColumnClass}>{detailsEl}</div>;
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
  cast: PropTypes.object,
  titleFormat: PropTypes.func,
  renderValue: PropTypes.bool,
  table: PropTypes.bool,
  components: PropTypes.object,
};

function DetailsPanel(props) {
  const {
    details = [], type, rowData = {},
    index, meta, components,
    titleFormat, renderValue, cast = {}, table,
  } = props;

  function renderDetails(key, rowData, details) {
    return (<Details
      key={key}
      details={details}
      rowData={rowData}
      type={type}
      index={index}
      meta={meta}
      components={components}
      titleFormat={titleFormat}
      renderValue={renderValue}
      cast={cast}
      table={table}
    />);
  }

  return (<div className={cast.Details?.root ?? defaultCast.Details.root}>
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
  cast: PropTypes.object,
  table: PropTypes.bool,
};

function Line(props) {
  const { data, index, type, className, columns, cast } = props;
  const tdClass = (cast.Table?.td ?? defaultCast.Table.td) + " " + className;

  const columnsEl = columns.map(key => (
    <td className={tdClass} key={key}>
      { type.types[key].renderColumn(type.types[key].read(data[key]), data[key], index, key, type.meta, cast) }
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
};

function ExpandLine(props) {
  const { data, index, type, className, icons, detailPanel, columns, cast } = props;
  const [ open, setOpen ] = useState(false);
  const tdClass = (cast.Table?.td ?? defaultCast.Table.td) + " " + className;
  const rotateClass = cast.rotate ?? defaultCast.rotate;

  const columnsEl = [(
    <td key="expand" className={tdClass}>
      <IconButton
        data-testid="expand"
        iconClassName={open ? rotateClass : ""}
        Component={icons.DetailPanel}
        onClick={() => setOpen(!open)}
      />
    </td>
  )].concat(columns.map(key => (
    <td key={key} className={tdClass}>
      { type.types[key].renderColumn(type.types[key].read(data[key]), data[key], index, key, type.meta, cast) }
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
  cast: PropTypes.object,
};

function DefaultToolbar(props) {
  const { title, children, cast } = props;

  return (<div className={cast.Table?.Toolbar?.root ?? defaultCast.Table.Toolbar.root}>
    <span className={cast.Table?.title ?? defaultCast.Table.title}>{ title }</span>
    <div className={cast.Table?.Toolbar?.content ?? defaultCast.Table.Toolbar.content}>
      { children }
    </div>
  </div>);
}

DefaultToolbar.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  cast: PropTypes.object,
};

export default function Table(props) {
  const {
    title = "", name = "table", data, type,
    columns = [], filters = [], details = [],
    icons, components = {}, t, cast = {},
    titleFormat = title => title + ": ",
    renderValue, detailsTable, global,
  } = props;
  const thClass = cast.Table?.th ?? defaultCast.Table.th;
  const tableClass = cast.Table?.table ?? defaultCast.Table.table;
  const lineClass = cast.line ?? defaultCast.line;
  const labelTitleClass = cast.Label?.title ?? defaultCast.Label.title;
  const tableRootClass = cast.Table?.root ?? defaultCast.Table.root;
  const { Toolbar = DefaultToolbar } = components;
  const { filtersEl, filteredData } = useFilters({ data, type, config: filters, global, cast });
  const upMeta = {
    t: t ?? (a => a),
    ...type.meta,
  };

  const div = details.length;

  const detailPanel = div ? function detailPanel(rowData, index) {
    return (<DetailsPanel
      details={details}
      type={type}
      rowData={rowData}
      index={index}
      meta={upMeta}
      components={components}
      cast={cast}
      titleFormat={titleFormat}
      renderValue={renderValue}
      table={detailsTable}
    />);
  } : null;

  const Tooltip = components?.Tooltip ?? MaybeTip;

  const headEl = (detailPanel ? [<th key="expand"></th>] : []).concat(
    // TODO support recursive type columns aka "robot.name"
    columns.map((key, index) => {
      const Label = type.types[key].Label;
      return (<th key={key} className={thClass}><Tooltip cast={cast} tooltip={<>
          <div className={labelTitleClass}>{ type.types[key].label ?? type.types[key].constructor.name }</div>
          <Label self={type.types[key]} upMeta={upMeta} index={index} enumKey={key} cast={cast} />
        </>}>
        { upMeta.t(type.types[key].title) }
      </Tooltip></th>);
    })
  );

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
      cast={cast}
    />
  ));

  return (<>
    <Toolbar title={title} data={data} cast={cast}>
      { filtersEl }
    </Toolbar>

    <div className={tableRootClass}>
      <table className={tableClass}>
        <thead>
          <tr>{ headEl }</tr>
        </thead>
        <tbody className={lineClass}>
          { linesEl }
        </tbody>
      </table>
    </div>
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
  components: PropTypes.object,
  cast: PropTypes.object,
  renderValue: PropTypes.bool,
  titleFormat: PropTypes.func,
  detailsTable: PropTypes.bool,
  global: PropTypes.object,
};
