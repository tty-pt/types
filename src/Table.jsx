import React from "react";
import PropTypes from "prop-types";
import MaybeTip from "./MaybeTip";
import MaterialTable from "material-table";
import "./styles/vim.css";

const defaultContainerClass = "ouborder ml8";
const defaultHeaderClass = "f fic h8";
const defaultInvalidClass = "cfinvalid";
const defaultTitleClass = "tb";
const defaultDetailsClass = "p h";
const defaultTableClass = "tblf shf";

function Details(props) {
  const {
    rowData, types, details, config,
  } = props;

  const {
    titleFormat = title => title + ": ",
    containerClass = defaultContainerClass,
    invalidClass = defaultInvalidClass,
    titleClass = defaultTitleClass,
    headerClass = defaultHeaderClass,
    tableClass = defaultTableClass,
    Tooltip = MaybeTip,
    renderValue,
    table,
  } = config;

  const maybeTableMap = {
    [true]: (field, value, type) => {
      const recurseEl = type.types ? (
        <tr key={field + "-types"}>
          <td colSpan="2">
            <table className={containerClass + " " + tableClass}>
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
        <div className={containerClass} key={field + "-types"}>
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
    return (<table className={tableClass}>
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

export default function Table(props) {
  const { data, types, columns, title, details, options, icons, actions } = props;
  const { typedDetails = {} } = options;
  let { detailsClass = defaultDetailsClass } = typedDetails;

  function renderDetails(key, rowData, details) {
    return (<Details
      key={key}
      details={details}
      rowData={rowData}
      types={types}
      config={typedDetails}
    />);
  }

  const div = details.length;

  function detailPanel(rowData) {
    return (<div className={detailsClass + " xh" + div}>
      { details.map((detail, idx) => renderDetails(idx, rowData, detail)) }
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
    className="typed"
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
