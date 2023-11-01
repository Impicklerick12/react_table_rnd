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
const updatedMenuData = MOCK_MENU_DATA.map(row => ({
    ...row,
    cells: Object.keys(row).map((id, index) => ({
      id: id,
      value: row[id],
      index: index,
      style: {}
    }))
  }));
const initState = { columns: menuColumns, data: updatedMenuData }

const App = () => {
  const [tables, setTables] = useState([initState]);
  const [selectedCells, setSelectedCells] = useState({});

  const handleAddNewTable = () => {
    const updatedRows = initState.data.map(row => ({
      ...row,
      id: uuid()
    }))
    const updatedTable = tables.concat({ ...initState, data: updatedRows, id: uuid() });
    setTables(updatedTable)
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
    setTables([updatedState]);
  }

  const handleApplyBackgroundColor = () => {
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    Object.keys(selectedCells).forEach(id => document.getElementById(id).style.backgroundColor = randomColor)
    setSelectedCells({})
  }

  return (
    <div className="wrapper">
      <div className="tableWrapper">
        {tables.map(({ columns, data, id }) => (
          <MultifeaturedTable
            columns={columns}
            data={data}
            selectedCells={selectedCells}
            setSelectedCells={setSelectedCells}
            id={id}
          />
        ))}
      </div>
      <div className="actionButtons">
        <button onClick={() => handleAlternateRowStyling()}>Add Alternate Row Color</button>
        <button onClick={() => handleAddNewTable()}>Add New Table</button>
        {Object.keys(selectedCells).length > 0 && (
          <button onClick={() => handleApplyBackgroundColor()}>Apply random color</button>
        )}
      </div>
    </div>
  );
}

export default App;
