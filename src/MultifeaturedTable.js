import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import PropTypes from "prop-types";

const MultifeaturedTable = (props) => {
  const columns = useMemo(() => props.columns, [props.columns]);
  const data = useMemo(() => props.data, [props.data]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      // sorting,
      // globalFilter,
      // columnVisibility,
      // columnSizing: {
      //   "drinkCategory": 20
      // }
    },
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    // onColumnSizingChange: handleColumnSizeChange,
    // onSortingChange: setSorting,
    // onGlobalFilterChange: setGlobalFilter,
    // onColumnVisibilityChange: setColumnVisibility,
    // getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    // getSortedRowModel: getSortedRowModel(),
  });
  const headerGroups = table.getHeaderGroups();
  const tableRows = table.getRowModel().rows;
  // console.log(table.getState())
  // console.log(table.getRowModel().rows)
  // console.log(props.selectedCells)


    const generateCell = (tableCell) => {
        const cell = tableCell.column.columnDef.cell;
        const cellContext = tableCell.getContext();
        const rowData = cellContext.row.original;
        const cellId = `${cellContext.cell.id}_${rowData.id}`;
        const isCellSelected = Object.keys(props.selectedCells).includes(cellId);

        return (
        <td
            key={cellId}
            id={cellId}
            onClick={() => handleSelectedCells(cellId, cellContext)}
            data-is-selected={isCellSelected}
        >
            {flexRender(cell, cellContext)}
        </td>
        );
    };

    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    const shuffleColumns = () => {
      let columns = table.getAllLeafColumns().map(col => col.id)
      for (let i = columns.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = columns[i];
        columns[i] = columns[j];
        columns[j] = temp;
      }
      table.setColumnOrder(columns)
    }

  const getContainerCssClass = () => {
    if (props.containerCssClass) return props.containerCssClass;
    return "table-container";
  };

  const getSortingArrowStyles = (id) => {
    let classes = ["sorting-arrow"];
    let findId = sorting.filter((e) => e.id === id);
    classes.push(
      findId.length > 0 && !findId[0].desc
        ? "sorting-arrow-up"
        : "sorting-arrow-down"
    );
    if (findId.length === 0) return "sorting-arrow-display-none";
    return classes.join(" ");
  };

  const handleSelectedCells = (selectedId, cellContext) => {
    if (Object.keys(props.selectedCells).includes(selectedId)) {
      const updatedSelectedCells = {...props.selectedCells}
      delete updatedSelectedCells[selectedId];
        props.setSelectedCells(updatedSelectedCells);
        return;
    }
    props.setSelectedCells({
      ...props.selectedCells,
      [selectedId]: {
        rowId: cellContext.row.id,
        columnkey: cellContext.column.id,
        columnId: cellContext.row.original.id
      }
    });
  }

  return (
    <>
      <div className={getContainerCssClass()}>
        <table>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ position: "relative", width: header.getSize() }}
                  >
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "cursor-pointer select-none flex-direction-row"
                          : "flex-direction-row",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <div className="sorting-arrow-container">
                        <div className={getSortingArrowStyles(header.id)} />
                      </div>
                    </div>
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`resizer ${
                          header.column.getIsResizing() ? "isResizing" : ""
                        }`}
                      ></div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.id} style={row.original.style}>
                {row.getVisibleCells().map((cell) => generateCell(cell))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => shuffleColumns()}>Shuffle Column Order</button>
    </>
  );
};

MultifeaturedTable.propTypes = {
  containerCssClass: PropTypes.string,
};

export default MultifeaturedTable;
