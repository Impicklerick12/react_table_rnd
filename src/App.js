import React, { useState } from "react";
import MultifeaturedTable from "./MultifeaturedTable";
import { createColumnHelper } from '@tanstack/react-table'
import './App.css';
import { MOCK_MENU_DATA, MOCK_COLUMNS } from "./mockData";
import { v4 as uuid } from 'uuid';

const columnHelper = createColumnHelper();
const convertColumnsToMenuColumns = columns => {
  return columns.map(columnGroup => {
    return columnHelper.group({
      id: columnGroup.id || uuid(),
      header: () => <span>{columnGroup.value}</span>, // would render custom cell container here, rendering Textbox/UncontrolledContentEditable component
      columns: columnGroup.columns.map(column => {
        return columnHelper.accessor(column.accessorKey, {
          header: () => <span>{column.header}</span>, // would render custom cell container here, rendering Textbox/UncontrolledContentEditable component
          cell: info => info.getValue(),
          footer: props => props.column.id,
        });
      }),
    });
  });
}

const menuColumns = convertColumnsToMenuColumns(MOCK_COLUMNS);
const initState = { columns: menuColumns, data: MOCK_MENU_DATA }

const App = () => {
  const [table, setTable] = useState([initState]);
  const handleAddNewTable = () => {
    const updatedTable = table.concat(initState)
    setTable(updatedTable)
  }
  const handleAlternateRowStyling = () => {
    const data = initState.data;
    for (let i = 0; i < data.length; i++) {
      // every odd row index
      if (i % 2 === 1) {
        data[i].style = {
          ...data[0].style,
          backgroundColor: "lightBlue"
        }
      }
    }
    const updatedState = {
      ...initState,
      data
    };
    setTable([updatedState]);
  }

  return (
    <div className="wrapper">
      <div className="tableWrapper">
        {table.map(({ columns, data }) => (
          <MultifeaturedTable
            columns={columns}
            data={data}
          />
        ))}
      </div>
      <button onClick={() => handleAlternateRowStyling()}>Add Alternate Row Color</button>
      <button onClick={() => handleAddNewTable()}>Add New Table</button>
    </div>
  );
}

export default App;
