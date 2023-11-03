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
import { useDrag, useDrop } from 'react-dnd';

const MultifeaturedTable = (props) => {
  const columns = useMemo(() => props.columns, [props.columns]);
  const memoData = useMemo(() => props.data, [props.data]);
  const [data, setData] = useState(memoData);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const moveRow = (dragIndex, hoverIndex) => {
    const updatedData = [...data];
    if (dragIndex) {
      debugger
      const draggedRow = updatedData[dragIndex];
      updatedData.splice(dragIndex, 1);
      updatedData.splice(hoverIndex, 0, draggedRow)
    }
    setData([...updatedData])
  }

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

  const DraggableRow = ({ index, row }) => {
    const dropRef = React.useRef(null)
    const dragRef = React.useRef(null)

    const [, drop] = useDrop({
      accept: 'row',
      hover(item, monitor) {
        if (!dropRef.current) {
          return
        }
        const dragIndex = item.index
        const hoverIndex = index
        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return
        }
        // Determine rectangle on screen
        const hoverBoundingRect = dropRef.current.getBoundingClientRect()
        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
        // Determine mouse position
        const clientOffset = monitor.getClientOffset()
        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top
  
        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return
        }
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return
        }

        moveRow(dragIndex, hoverIndex)
        item.index = hoverIndex
      },
    })

    const [{ isDragging }, drag, preview] = useDrag({
      type: 'row',
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    })

    const opacity = isDragging ? 0 : 1

    preview(drop(dropRef))
    drag(dragRef)

    return (
      <tr className="tableRow" key={row.id} ref={dropRef} style={row.original.style} data-is-dragging={isDragging}>
        {row.getVisibleCells().map((cell) => generateCell(cell, dragRef))}
      </tr>
    )
  }


    const generateCell = (tableCell, dragRef) => {
        const cell = tableCell.column.columnDef.cell;
        const cellContext = tableCell.getContext();
        const rowData = cellContext.row.original;
        const cellId = `${cellContext.cell.id}_${rowData.id}`;
        const isCellSelected = Object.keys(props.selectedCells).includes(cellId);
        const [index, accessor] = cellContext.cell.id.split("_");
        const style = props.rowMetaData[index].find(row => row.id === accessor).style;

        return (
        <td
            key={cellId}
            id={cellId}
            onClick={() => handleSelectedCells(cellId, cellContext)}
            data-is-selected={isCellSelected}
            style={{ ...style, cursor: "move" }}
            ref={dragRef}
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
            {tableRows.map((row, index) => (
              DraggableRow({ index, row, moveRow })
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
