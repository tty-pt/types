import React, { useState } from "react";
import PropTypes from "prop-types";
import MyPropTypes from "./prop-types";
import { Paper } from "@material-ui/core";
import MaybeTip from "./MaybeTip";
import { useCast } from "@tty-pt/styles";
import { useTranslation } from "react-i18next";
import useFilters from "./useFilters";
import IconButton from "./IconButton";

const defaultContainerCast = "marginLeftSmall borderTopDivider";
const defaultHeaderCast = "horizontalSmall alignItemsCenter";
const defaultInvalidCast = "colorErrorLight";
const defaultTitleCast = "fontWeightBold";
const defaultDetailsCast = "pad horizontal flexWrap flexGrowChildren";
const defaultTableCast = "tableLayoutFixed sizeHorizontalFull";

function Details(props) {
  const {
    rowData, types, details, config, index,
  } = props;

  const c = useCast();
  const { t } = useTranslation();

  const {
    titleFormat = title => title + ": ",
    containerCast = defaultContainerCast,
    invalidCast = defaultInvalidCast,
    titleCast = defaultTitleCast,
    headerCast = defaultHeaderCast,
    tableCast = defaultTableCast,
    Tooltip = MaybeTip,
    renderValue,
    table,
  } = config;

  const realContainerCast = containerCast + (tableCast ? " " + tableCast : "");
  const containerClass = c(realContainerCast);
  const headerClass = c(headerCast);
  const titleClass = c(titleCast);
  const invalidClass = c(invalidCast);

  const maybeTableMap = {
    [true]: (field, value, type) => {
      function renderRecurse(getSubInstance) {
        return (<tr key={field + "-children"}>
          <td colSpan="2">
            <table className={containerClass}>
              <tbody>
                {
                  Object.keys(value)
                    .map(key => mapDetails(key, value[key], getSubInstance(key)))
                }
              </tbody>
            </table>
          </td>
        </tr>);
      }

      const recurseEl = type.types ? (
        renderRecurse(key => type.types[key])
      ) : type.SubType ? (
        renderRecurse(key => new type.SubType(t(key), ...type.subTypeArgs))
      ) : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, tooltip, children, cellClass } = props;

        return (<>
          <tr key={field}>
            <td className={headerClass}>
              { renderValue ? <span>{ type.renderValue(value, index, field) }</span> : null }
              <span className={titleClass}>
                { titleFormat(type.detailsTitle) }
              </span>
            </td>
            <td className={cellClass}>
              <Tooltip tooltip={tooltip}>{ children }</Tooltip>
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
    [false]: (field, value, type) => {
      function renderRecurse(getSubInstance) {
        return (<div className={c(containerCast)} key={field + "-children"}>
          {
            Object.keys(value)
              .map(key => mapDetails(key, value[key], getSubInstance(key)))
          }
        </div>);
      }

      const recurseEl = type.types ? (
        renderRecurse(key => type.types[key])
      ) : type.SubType ? (
        renderRecurse(key => new type.SubType(t(key), ...type.subTypeArgs))
      ) : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, tooltip, children, cellClass } = props;

        return (<>
          <div key={field} className={headerClass}>
            { renderValue ? <span>{ type.renderValue(value, index, field) }</span> : null }
            <span className={titleClass}>
              { titleFormat(type.detailsTitle) }
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

  function mapDetails(field, value, type) {
    const isInvalid = type.invalid(value);
    const cellClass = isInvalid ? invalidClass : "";

    const Component = maybeTableMap[boolTable](field, value, type);

    return (<Component
      cellClass={cellClass}
      value={value}
      tooltip={type.detailsTooltip && type.detailsTooltip(value)}
      key={field}
    >
      { type.format(value) }
    </Component>);
  }

  const detailsEl = details.map(key => mapDetails(key, rowData[key], types[key]));

  if (table)
    return (<table className={c(tableCast)}>
      <tbody>
        { detailsEl }
      </tbody>
    </table>);
  else
    return <div>{detailsEl}</div>;
}

Details.propTypes = {
  rowData: PropTypes.object,
  details: PropTypes.arrayOf(PropTypes.string),
  types: PropTypes.object.isRequired,
  config: PropTypes.object,
  index: MyPropTypes.integer.isRequired,
};

function DetailsPanel(props) {
  const {
    details = [], types = {}, rowData = {},
    config = {}, index,
  } = props;
  const c = useCast();
  const { detailsCast = defaultDetailsCast } = config;

  function renderDetails(key, rowData, details) {
    return (<Details
      key={key}
      details={details}
      rowData={rowData}
      types={types}
      config={config}
      index={index}
    />);
  }

  return (<div className={c(detailsCast)}>
    { details.map((detail, idx) => renderDetails(idx, rowData, detail)) }
  </div>);
}

DetailsPanel.propTypes = {
  details: PropTypes.array.isRequired,
  rowData: PropTypes.object.isRequired,
  config: PropTypes.object,
  types: PropTypes.object.isRequired,
  index: PropTypes.object.isRequired,
};

function Line(props) {
  const { data, index, types, className, columns } = props;
  const c = useCast();
  const colClass = c("pad") + " " + className;

  const columnsEl = Object.entries(data).filter(([key]) => columns[key]).map(([key, value]) => {
    const type = types[key];
    return (<td className={colClass} key={key}>
      { type.renderColumn(value, index, key) }
    </td>);
  });

  return (<tr>{columnsEl}</tr>);
}

Line.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  types: PropTypes.object.isRequired,
  columns: PropTypes.object.isRequired,
  className: PropTypes.string,
};

function ExpandLine(props) {
  const { data, index, types, className, icons, detailPanel, columns } = props;
  const [ open, setOpen ] = useState(false);
  const c = useCast();
  const colClass = c("pad") + " " + className;

  const columnsEl = [(
    <td key="expand" className={colClass}>
      <IconButton
        iconClassName={open ? c("rotatePiOverTwo") : ""}
        Component={icons.DetailPanel}
        onClick={() => setOpen(!open)}
      />
    </td>
  )].concat(Object.entries(data).filter(([key]) => columns[key]).map(([key, value]) => {
    const type = types[key];
    return (<td key={key} className={colClass}>
      { type.renderColumn(value, index, key) }
    </td>);
  }));

  if (open)
    return (<>
      <tr>{columnsEl}</tr>
      <tr><td className={className} colSpan={columnsEl.length}>{detailPanel(data)}</td></tr>
    </>)

  else
    return <tr>{columnsEl}</tr>;
}

ExpandLine.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  types: PropTypes.object.isRequired,
  className: PropTypes.string,
  icons: PropTypes.object.isRequired,
  detailPanel: PropTypes.func.isRequired,
  columns: PropTypes.object.isRequired,
};

const horizontalCenterCast = "horizontal flexWrap alignItemsCenter"

function DefaultToolbar(props) {
  const { title, children } = props;
  const c = useCast();

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
};

export default function Table(props) {
  const { title = "", name = "table", data, types, columns, details = [], options = {}, icons } = props;
  const { components = {}, typedDetails = {} } = options;
  const { Toolbar = DefaultToolbar } = components;
  const { filtersEl, filteredData } = useFilters({ data, types, columns, options: options.filters });
  const c = useCast();

  const div = details.length;

  const detailPanel = div ? function detailPanel(rowData, index) {
    return (<DetailsPanel
      details={details}
      types={types}
      config={typedDetails}
      rowData={rowData}
      index={index}
    />);
  } : null;

  const colClass = c("pad");

  const headEl = (detailPanel ? [<th key="expand"></th>] : []).concat(
    Object.keys(columns).map(key => {
      const type = types[key];
      return (<th key={key} className={colClass}>{ type.title }</th>);
    })
  );

  const lineClass = c("borderTopDivider");
  const LineComponent = detailPanel ? ExpandLine : Line;

  const linesEl = filteredData.map((rowData, index) => (
    <LineComponent
      key={index}
      index={index}
      data={rowData}
      types={types}
      icons={icons}
      detailPanel={detailPanel}
      className={lineClass}
      columns={columns}
    />
  ));

  return (<>
    <Toolbar title={title}>
      { filtersEl }
    </Toolbar>

    <Paper className={"typed " + c("overflowAuto")}>
      <table className={c("sizeHorizontalFull")}>
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
  columns: PropTypes.object,
  data: PropTypes.array,
  options: PropTypes.object,
  icons: PropTypes.object,
  details: PropTypes.array,
  types: PropTypes.object.isRequired,
  title: PropTypes.string,
  name: PropTypes.string,
};
