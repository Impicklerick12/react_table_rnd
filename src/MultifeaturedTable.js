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
  const [selectedCells, setSelectedCells] = useState([]);

  const table = useReactTable({
    data,
    columns,
    // state: {
    //   sorting,
    //   globalFilter,
    //   columnVisibility,
    // },
    enableColumnResizing: true,
    columnResizeMode: "onChange",
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
    const generateCell = tableCell => {
        const cell = tableCell.column.columnDef.cell;
        const cellContext = tableCell.getContext();
        const cellId = cellContext.cell.id;
        const cellStyle = cellContext.row.original.style;

        return (
            <td 
                key={cellId} 
                onClick={() => handleSelectedCells(cellId)} 
                data-is-selected={selectedCells.includes(cellId)}
                style={cellStyle}
            >
                {flexRender(cell, cellContext)}
            </td>
        )
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

  const handleSelectedCells = selectedId => {
    if (selectedCells.includes(selectedId)) {
        setSelectedCells(selectedCells.filter(id => id !== selectedId));
        return;
    }
    setSelectedCells(selectedCells.concat(selectedId));
  }

  return (
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => generateCell(cell))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

MultifeaturedTable.propTypes = {
  containerCssClass: PropTypes.string,
};

export default MultifeaturedTable;
