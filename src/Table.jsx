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
  const containerClass = cast.container ?? defaultCast.container;
  const headerClass = cast.header ?? defaultCast.header;
  const titleClass = cast.title ?? defaultCast.title;
  const invalidClass = cast.invalid ?? defaultCast.invalid;
  const detailClass = cast.detail ?? defaultCast.detail;
  const tooltipContainerClass = cast.tooltipContainer ?? defaultCast.tooltipContainer;
  const typeTitleClass = cast.typeTitle ?? defaultCast.typeTitle;

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
        const Label = subType.Label;

        return (<>
          <tr key={field}>
            <td className={headerClass}>
              { renderValue ? <span>{ subType.renderValue(subType.read(value), index, field, upMeta, cast) }</span> : null }
              <span className={titleClass}>
                <Tooltip cast={cast} tooltip={<div className={tooltipContainerClass}>
                    <div className={typeTitleClass}>{ subType.constructor.name }</div>
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
              <Tooltip cast={cast} tooltip={tooltip}>{ children }</Tooltip>
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
        const Label = subType.Label;

        return (<>
          <div key={field} className={headerClass}>
            { renderValue ? <span>{ subType.renderValue(subType.read(value), index, field, upMeta, cast) }</span> : null }
            <span className={titleClass}>
              <Tooltip cast={cast} tooltip={<div className={tooltipContainerClass}>
                  <div className={typeTitleClass}>{ subType.constructor.name }</div>
                  <Label self={subType} upMeta={upMeta} index={index} enumKey={field} cast={cast} />
              </div>}>{
              titleFormat(meta.t(pType.SubType
                ? titleCamelCase(field)
                : subType.detailsTitle
              ))
              }</Tooltip>
            </span>
            <span className={cellClass}>
              <Tooltip cast={cast} tooltip={tooltip}>{ children }</Tooltip>
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
    const read = subType.read(value, meta);
    const isInvalid = subType.invalid(read);
    const cellClass = isInvalid ? invalidClass : "";
    const Component = maybeTableMap[boolTable](field, value, type, subType, meta);

    return (<Component
      cellClass={cellClass}
      value={value}
      tooltip={subType.detailsTooltip(value, meta)}
      key={field}
    >
      { subType.format(read, meta) }
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

  return (<div className={cast.details ?? defaultCast.details}>
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
  const colClass = (cast.col ?? defaultCast.col) + " " + className;

  const columnsEl = columns.map(key => (
    <td className={colClass} key={key}>
      { type.types[key].renderColumn(data[key], index, key, type.meta, cast) }
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
  const colClass = (cast.col ?? defaultCast.col) + " " + className;
  const rotateClass = cast.rotate ?? defaultCast.rotate;

  const columnsEl = [(
    <td key="expand" className={colClass}>
      <IconButton
        data-testid="expand"
        iconClassName={open ? rotateClass : ""}
        Component={icons.DetailPanel}
        onClick={() => setOpen(!open)}
      />
    </td>
  )].concat(columns.map(key => (
    <td key={key} className={colClass}>
      { type.types[key].renderColumn(data[key], index, key, type.meta, cast) }
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

  return (<div className={cast.toolbar?.container ?? defaultCast.toolbar.container}>
    <span className={cast.toolbar?.title ?? defaultCast.toolbar.title}>{ title }</span>
    <div className={cast.toolbar?.content ?? defaultCast.toolbar.content}>
      { children }
    </div>
  </div>);
}

DefaultToolbar.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};

export default function Table(props) {
  const {
    title = "", name = "table", data, type,
    columns = [], filters = [], details = [],
    icons, components = {}, t, cast = {},
    titleFormat = title => title + ": ",
    renderValue, detailsTable, global,
  } = props;
  const thClass = cast.th ?? defaultCast.th;
  const tableClass = cast.table ?? defaultCast.table;
  const lineClass = cast.line ?? defaultCast.line;
  const tooltipContainerClass = cast.tooltipContainer ?? defaultCast.tooltipContainer;
  const typeTitleClass = cast.typeTitle ?? defaultCast.typeTitle;
  const tableParentClass = cast.tableParent ?? defaultCast.tableParent;
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
      cast={cast.details}
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
      return (<th key={key} className={thClass}><Tooltip cast={cast} tooltip={<div className={tooltipContainerClass}>
          <div className={typeTitleClass}>{ type.types[key].constructor.name }</div>
          <Label self={type.types[key]} upMeta={upMeta} index={index} enumKey={key} cast={cast} />
        </div>}>
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

    <div className={tableParentClass}>
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
