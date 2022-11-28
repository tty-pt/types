import React from "react";
import PropTypes from "prop-types";
import MyPropTypes from "./prop-types";
import MaterialTable from "material-table";
import { Tooltip } from "@material-ui/core";

const invalidStyle = {
  color: "#ff9386",
};

const flexStyle = {
  display: "flex",
  alignItems: "center",
};

const valueStyle = {
  marginRight: "8px",
};

const headerStyle = {
  ...flexStyle,
  ...valueStyle,
  fontWeight: "bold",
};

const innerContainerStyles = {
  marginLeft: "8px",
  boxShadow: "0px 0px 3px rgba(0, 0, 0, 0.5)",
};

const markStyles = {
  color: "inherit",
  fontWeight: "bold",
  backgroundColor: "inherit",
};

function Details(props) {
  const {
    table, rowData, types, style, details, titleFormat = title => title + ": ",
  } = props;

  function mapDetailsTable(field, value, type) {
    const isInvalid = type.invalid(value);
    const cellStyle = isInvalid ? invalidStyle : {};

    const recurseEl = type.types ? (
      <tr key={field + "-types"}>
        <td colSpan="2">
          <table
            style={{
              ...innerContainerStyles,
              width: "100%",
            }}
          >
            <tbody>
              {
                Object.keys(value)
                  .map(key => mapDetailsTable(key, value[key], type.types[key]))
              }
            </tbody>
          </table>
        </td>
      </tr>
    ) : null;

    function Component(props) {
      const { value, tooltip, children } = props;

      const tooltipEl = tooltip ? tooltip.split("\n").map((line, idx) => (
        <div key={idx}>{line}</div>
      )) : null;

      return (<>
        <tr key={field}>
          <td style={headerStyle}>
            <span style={valueStyle}>
              {type.renderValue(value)}
            </span>
            <span>
              { titleFormat(type.detailsTitle) }
            </span>
          </td>
          <td style={cellStyle}>
            {
              tooltipEl ? (
                <Tooltip title={tooltipEl}>
                  <span style={flexStyle}>
                    <span>{ children }</span>
                    <mark style={markStyles}>*</mark>
                  </span>
                </Tooltip>
              ) : children
            }
          </td>
        </tr>
        { recurseEl }
      </>);
    }

    Component.propTypes = {
      tooltip: PropTypes.string,
      children: PropTypes.node,
      value: PropTypes.any,
    };

    return (<Component value={value} tooltip={type.detailsTooltip && type.detailsTooltip(value)} key={field}>
      { type.format(value) }
    </Component>);
  }

  // MAP_DETAILS_NO_TABLE

  function mapDetailsNoTable(field, value, type) {
    const isInvalid = type.invalid(value);
    const cellStyle = isInvalid ? invalidStyle : {};

    const recurseEl = type.types ? (
      <div style={innerContainerStyles} key={field + "-types"}>
        {
          Object.keys(value)
            .map(key => mapDetailsNoTable(key, value[key], type.types[key]))
        }
      </div>
    ) : null;

    function Component(props) {
      const { value, tooltip, children } = props;

      const tooltipEl = tooltip ? tooltip.split("\n").map((line, idx) => (
        <div key={idx}>{line}</div>
      )) : null;

      return (<>
        <div key={field} style={flexStyle}>
          <span style={headerStyle}>
            <span style={valueStyle}>
              { type.renderValue(value) }
            </span>
            <span>
              { titleFormat(type.detailsTitle) }
            </span>
          </span>
          <span style={cellStyle}>
            {
              tooltipEl ? (
                <Tooltip title={tooltipEl}>
                  <span style={flexStyle}>
                    <span>{ children }</span>
                    <mark style={markStyles}>*</mark>
                  </span>
                </Tooltip>
              ) : children
            }
          </span>
        </div>
        { recurseEl }
      </>);
    }

    Component.propTypes = {
      value: PropTypes.any,
      tooltip: PropTypes.string,
      children: PropTypes.node,
    };

    return (<Component
      value={value}
      tooltip={type.detailsTooltip && type.detailsTooltip(value)}
      key={field}
    >
      <div>{ type.format(value) }</div>
    </Component>);
  }

  const mapDetails = table ? mapDetailsTable : mapDetailsNoTable;
  const detailsEl = details.map(key => mapDetails(key, rowData[key], types[key]));

  if (table)
    return (<table style={style}>
      <tbody>
        { detailsEl }
      </tbody>
    </table>);
  else
    return <>{detailsEl}</>;
}

Details.propTypes = {
  rowData: PropTypes.object,
  details: PropTypes.arrayOf(PropTypes.string),
  style: MyPropTypes.style,
  table: PropTypes.bool,
  titleFormat: PropTypes.func,
  types: PropTypes.object.isRequired,
};

export default function Table(props) {
  const { data, types, columns, title, details, options, icons, actions } = props;
  const { typedDetails = {} } = options;
  const { table, spacing = 16, parentStyle = {} } = typedDetails;

  const realParentStyle = {
    ...parentStyle,
    overflow: "hidden",
  };

  const sideStyles = {
    width: "calc((100% - " + spacing + "px) / " + details.length + ")",
    float: "left",
  };

  function tableDetails(key, styles, rowData, details) {
    return (<Details
      key={key}
      style={{
        ...styles,
        tableLayout: "fixed",
      }}
      details={details}
      rowData={rowData}
      types={types}
      table
    />);
  }

  function noTableDetails(key, styles, rowData, details) {
    return (<div key={key} style={styles}>
      <Details
        details={details}
        rowData={rowData}
        types={types}
      />
    </div>);
  }

  const renderDetails = table ? tableDetails : noTableDetails;

  const notLastStyles = {
    ...sideStyles,
    marginRight: spacing + "px",
  };

  function detailPanel(rowData) {
    return (<div style={realParentStyle}>
      { details.slice(0, -1).map((detail, idx) => renderDetails(idx, notLastStyles, rowData, detail)) }
      { renderDetails("last", sideStyles, rowData, details[details.length - 1]) }
    </div>);
  }

  const newColumns = columns.map(field => {
    return {
      field,
      render: rowData => types[field].renderColumn(rowData[field]),
      title: types[field].title,
      headerStyle: { textAlign: "center" },
    };
  });

  return (<MaterialTable
    title={title}
    columns={newColumns}
    data={data}
    options={options}
    icons={icons}
    actions={actions}
    detailPanel={detailPanel}
  />);
}

Table.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.array,
  data: PropTypes.array,
  options: PropTypes.object,
  icons: PropTypes.object,
  actions: PropTypes.array,
  details: PropTypes.array,
  types: PropTypes.object.isRequired,
};
