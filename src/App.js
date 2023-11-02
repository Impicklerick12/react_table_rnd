import React, { useState } from "react";
import MultifeaturedTable from "./MultifeaturedTable";
import { createColumnHelper } from '@tanstack/react-table'
import './App.css';
import { MOCK_MENU_DATA, MOCK_COLUMNS, TWO_COLUMNS, TWO_COLUMNS_DATA, REAL_ESTATE_COLUMNS, REAL_ESTATE_DATA } from "./mockData";
import { v4 as uuid } from 'uuid';

const TABLE_WIDTH = 1000; // would come from design data

const columnHelper = createColumnHelper();
// the below should be updated to handle multiple nested column groups
// currently only handles one group
// i.e. group > group > accessor.
const convertColumnsToMenuColumns = columns => {
  const generateAccessorColumns = column => {
    return columnHelper.accessor(column.accessorKey, {
      header: () => <span>{column.header}</span>,
      cell: info => <span>{info.getValue()}</span>,
      footer: props => props.column.id,
      size: column.width ? (column.width / 10) * TABLE_WIDTH : "auto" // determine column width based on element column data
    });
  }
  
  return columns.map(column => {
    if (column.type === "group") {
      return columnHelper.group({
        id: column.id || uuid(),
        header: () => <span>{column.value}</span>,
        // see comment above function
        columns: column.columns.map(column => generateAccessorColumns(column))
      });
    } else if (column.type === "accessor") {
      return generateAccessorColumns(column)
    }
  });
}
// NOTE; Any above span tags would be replaced by custom cell containers, rendering Textbox/UncontrolledContentEditable component
// cell: info - info is the cell data passed into the flexRender function

const menuColumns = convertColumnsToMenuColumns(MOCK_COLUMNS);
const initState = { columns: menuColumns, data: MOCK_MENU_DATA }

const App = () => {
  const [tables, setTables] = useState([initState]);
  const [selectedCells, setSelectedCells] = useState({});

  const handleAddNewTable = () => {
    const updatedRows = initState.data.map(row => ({
      ...row,
      id: uuid()
    }))
    const updatedTables = tables.concat({ ...initState, data: updatedRows, id: uuid() });
    setTables(updatedTables)
  }

  const handleAddDifferentTable = () => {
    const originalTable = {
      columns: MOCK_COLUMNS,
      data: MOCK_MENU_DATA
    }
    const twoColumnTable = { 
      columns: TWO_COLUMNS, 
      data: TWO_COLUMNS_DATA
    };
    const realEstateTable = { 
      columns: REAL_ESTATE_COLUMNS, 
      data: REAL_ESTATE_DATA
    };
  
    const tablesArr = [originalTable, twoColumnTable, realEstateTable];
    const getRandomTable = () => {
      return tablesArr[(Math.floor(Math.random() * tablesArr.length))];
    }
    const randomTable = getRandomTable();
    const uniqueRandomTable = {
      columns: convertColumnsToMenuColumns(randomTable.columns),
      data: randomTable.data.map(row => ({
        ...row,
        id: uuid()
      })),
      id: uuid()
    }

    const updatedTables = tables.concat(uniqueRandomTable);
    setTables(updatedTables)
  }

  const handleAlternateRowStyling = () => {
    const updatedTables = [...tables].map(table => {
      for (let i = 0; i < table.data.length; i++) {
        // every odd row index
        if (i % 2 === 1) {
          table.data[i].style = {
            ...table.data[0].style,
            backgroundColor: "lightBlue"
          }
        }
      }
      return table;
    });
    setTables(updatedTables);
  }

  const handleApplyBackgroundColor = () => {
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    Object.keys(selectedCells).forEach(id => document.getElementById(id).style.backgroundColor = randomColor)
    setSelectedCells({})
  }

  return (
    <div className="wrapper">
      <div className="tableWrapper" style={{ width: `${TABLE_WIDTH}px` }}>
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
        <button onClick={() => handleAddDifferentTable()}>Add Different Table</button>
        {Object.keys(selectedCells).length > 0 && (
          <button onClick={() => handleApplyBackgroundColor()}>Apply random color</button>
        )}
      </div>
    </div>
  );
}

export default App;
