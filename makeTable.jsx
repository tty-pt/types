import React from "react";
import PropTypes from "prop-types";
import MyPropTypes from "./prop-types";
import MaterialTable from "material-table";
import { Tooltip } from "@material-ui/core";

const invalidStyle = {
  backgroundColor: "#f0afbe",
}; // TODO make this a CSS class

export default function makeTable(types) {
  function Table(props) {
    const { data, columns, title, options, icons, actions, detailPanel } = props;

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
    detailPanel: PropTypes.func,
  };

  function TableDetails(props) {
    const { rowData, details, className, style } = props;

    const detailsEl = details.map(field => {
      const type = types[field];
      const value = rowData[field];
      const isInvalid = type.invalid(value);

      if (type.detailsTooltip) {
        const title = type.detailsTooltip(value);

        if (title) {
          const tooltipEl = title.split("\n").map(line => (
            <div key={line}>{line}</div>
          ));

          return (<tr key={field}>
            <td>{ type.title }</td> 
            <td style={isInvalid ? invalidStyle : {}}>
              <Tooltip title={tooltipEl}>
                <div>{ type.format(value) }</div>
              </Tooltip>
            </td>
          </tr>);
        }
      }

      return (<tr key={field}>
        <td>{ type.title }</td> 
        <td style={isInvalid ? invalidStyle : {}}>
          { type.format(value) }
        </td>
      </tr>);
    });

    return (<table className={className} style={style}>
      <tbody>
        { detailsEl }
      </tbody>
    </table>);
  }

  TableDetails.propTypes = {
    rowData: PropTypes.object,
    details: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    style: MyPropTypes.style,
  };

  return { Table, TableDetails };
}
