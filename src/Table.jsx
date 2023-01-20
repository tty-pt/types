import React from "react";
import PropTypes from "prop-types";
import MaybeTip from "./MaybeTip";
import MaterialTable from "material-table";
import { useCast } from "@tty-pt/styles";
import useFilters from "./useFilters";

const defaultContainerCast = "marginLeftSmall borderTopDivider";
const defaultHeaderCast = "horizontalSmall alignItemsCenter";
const defaultInvalidCast = "colorErrorLight";
const defaultTitleCast = "fontWeightBold";
const defaultDetailsCast = "pad horizontal flexWrap flexGrowChildren";
const defaultTableCast = "tableLayoutFixed sizeHorizontalFull";

function Details(props) {
  const {
    rowData, types, details, config,
  } = props;

  const c = useCast();

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
      const recurseEl = type.types ? (
        <tr key={field + "-types"}>
          <td colSpan="2">
            <table className={containerClass}>
              <tbody>
                {
                  Object.keys(value)
                    .map(key => mapDetails(key, value[key], type.types[key]))
                }
              </tbody>
            </table>
          </td>
        </tr>
      ) : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, tooltip, children, cellClass } = props;

        return (<>
          <tr key={field}>
            <td className={headerClass}>
              { renderValue ? <span>type.renderValue(value)</span> : null }
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
      const recurseEl = type.types ? (
        <div className={c(containerCast)} key={field + "-types"}>
          {
            Object.keys(value)
              .map(key => mapDetails(key, value[key], type.types[key]))
          }
        </div>
      ) : null;

      function Component(props) {
        /* eslint-disable-next-line no-unused-vars */
        const { value, tooltip, children, cellClass } = props;

        return (<>
          <div key={field} className={headerClass}>
            { renderValue ? <span>type.renderValue(value)</span> : null }
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
};

function DetailsPanel(props) {
  const {
    details = [], types = {}, rowData = {},
    config = {},
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
    />);
  }

  return (<div className={c(detailsCast)}>
    { details.map((detail, idx) => renderDetails(idx, rowData, detail)) }
  </div>);
}

DetailsPanel.propTypes = {
  details: PropTypes.array,
  rowData: PropTypes.object,
  config: PropTypes.object,
  types: PropTypes.object,
};

export default function Table(props) {
  const { data, types, columns, title, details = [], options = {}, icons, actions } = props;
  const { typedDetails = {} } = options;
  const { filtersEl, filteredData } = useFilters({ data, types, columns, options: options.filters });
  const c = useCast();

  const div = details.length;

  const detailPanel = div ? function detailPanel(rowData) {
    return (<DetailsPanel
      details={details}
      types={types}
      config={typedDetails}
      rowData={rowData}
    />);
  } : [];

  const newColumns = Object.keys(columns).map(key => {
    const type = types[key];
    return {
      field: key,
      render: rowData => type.renderColumn(rowData[key]),
      title: type.title,
      // type: type.mtType,
      headerStyle: { textAlign: "center" },
    };
  });

  return (<>
    <div className={c("horizontal flexWrap alignItemsCenter justifyContentEnd")}>
      { filtersEl }
    </div>
    
    <MaterialTable
      className="typed"
      title={title}
      columns={newColumns}
      data={filteredData}
      options={{
        ...options,
        search: false,
        filtering: false,
      }}
      icons={icons}
      actions={actions}
      detailPanel={detailPanel}
      components={{ Toolbar: () => null }}
    />
  </>);
}

Table.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.object,
  data: PropTypes.array,
  options: PropTypes.object,
  icons: PropTypes.object,
  actions: PropTypes.array,
  details: PropTypes.array,
  types: PropTypes.object.isRequired,
};
