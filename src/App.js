import React, { Component } from "react";
import style from "./style.module.css";
import { TABLE_DATA } from "./data";

const isSameCell = (a, b) => (`${a}` === `${b}`);
const isReferenceCell = (targetCells, cell) => (
  Boolean(targetCells.find((targetCell) => isSameCell(targetCell, cell)))
);

class Table2 extends Component {
  constructor(props) {
    super(props);
    this.getNumberOfCols = this.getNumberOfCols.bind(this);
    this.getNumberOfRows = this.getNumberOfRows.bind(this);
    this.resetRowOrder = this.resetRowOrder.bind(this);
    this.moveRow = this.moveRow.bind(this);
    this.computeRowSpan = this.computeRowSpan.bind(this);
    this.computeColSpan = this.computeColSpan.bind(this);
    this.duplicateRow = this.duplicateRow.bind(this);
    this.addRow = this.addRow.bind(this);
    this.addColumn = this.addColumn.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.getMergedCellContent = this.getMergedCellContent.bind(this);
    this.handleSelectedCells = this.handleSelectedCells.bind(this);
    
    this.state = {
      layout: TABLE_DATA.layout,
      content: TABLE_DATA.content,
      selectedCells: []
    }
  }

  getMergedCellContent(targetCell) {
    const contents = this.state.layout.flatMap((row, rowIndex) => {
      const mergedCellIndexes = row.flatMap((cell, cellIndex) => (
        isSameCell(targetCell, cell) ? [cellIndex] : []
      ));
      return mergedCellIndexes.length
        ? mergedCellIndexes.map(cellIndex => this.state.content[rowIndex][cellIndex])
        : [];
    });
  
    return contents.flat();
  }
  
  getNumberOfRows() {
    return this.state.layout.length - 1;
  }

  getNumberOfCols() {
    return this.state.layout[0].length - 1;
  }

  resetRowOrder() {
    const resetLayout = this.state.layout.map((row, rowIndex) => (
      row.map((cell) => [rowIndex, cell[1]])
    ));
    this.setState({ layout: resetLayout})
  }

  moveRow(srcIndex, destIndex) {
    this.setState({ layout: this.layout.splice(destIndex, 0, ...this.state.layout.splice(srcIndex, 1)) });
    this.resetRowOrder();
  }

  computeRowSpan = (currentRowIndex, currentCellIndex) => {
    const lastRowIndex = this.state.layout.findLastIndex((row, rowIndex) => {
      if (rowIndex > currentRowIndex) {
        const currentCell = this.state.layout[currentRowIndex][currentCellIndex];
        return Boolean(row.findLast((cell) => isSameCell(currentCell, cell)));
      }
      return false;
    });
    return (lastRowIndex === -1) ? 1 : (lastRowIndex + 1) - currentRowIndex;
  };

  computeColSpan = (currentRowIndex, currentCellIndex) => {
    const currentRow = this.state.layout[currentRowIndex];
    const currentCell = currentRow[currentCellIndex];
    const nextCellIndex = currentRow.findLastIndex((nextCell, cellIndex) => {
      if (cellIndex > currentCellIndex && isSameCell(nextCell, currentCell)) {
        return true;
      }
      return false;
    });
    return (nextCellIndex === -1) ? 1 : ((nextCellIndex + 1) - currentCellIndex);
  };

  duplicateRow(rowIndex) {
    const duplicatedCells = [...this.state.layout[rowIndex]];
    this.setState({ layout: this.state.layout.splice(rowIndex, 0, duplicatedCells) });
    this.resetRowOrder();
  }

  addRow(rowIndex) {
    const length = this.getNumberOfCols() + 1;
    const newCells = Array.from({ length }, (v, i) => [rowIndex, i]);
    const layoutClone = [...this.state.layout];
    layoutClone.splice(rowIndex, 0, newCells)
    const contentClone = [...this.state.content];
    contentClone.splice(rowIndex, 0, newCells.map(cell => ['']));
    this.setState({ 
      layout: layoutClone,
      content: contentClone
    });
    // this.resetRowOrder();
  }

  deleteRow(rowIndex) {
    const layoutClone = [...this.state.layout];
    layoutClone.splice(rowIndex, 1);
    const contentClone = [...this.state.content];
    contentClone.splice(rowIndex, 1);
    this.setState({ 
      layout: layoutClone ,
      content: contentClone
    });
    // this.resetRowOrder();
  }

  addColumn(colIndex) {
    const updatedLayout = this.state.layout.map((row, index) => {
      const newArray = [...row];
      newArray.splice(colIndex, 0, [index, colIndex]);
      return newArray;
    });
    const updatedContent = this.state.content.map((row, index) => {
      const newArray = [...row];
      newArray.splice(colIndex, 0, ["", ""]);
      return newArray;
    });

    this.setState({
      layout: updatedLayout,
      content: updatedContent
    });
  }

  deleteColumn(colIndex) {
    const updatedLayout = this.state.layout.map((row, index) => {
      const newArray = [...row];
      newArray.splice(colIndex, 1);
      return newArray;
    });
    const updatedContent = this.state.content.map((row, index) => {
      const newArray = [...row];
      newArray.splice(colIndex, 1);
      return newArray;
    });

    this.setState({
      layout: updatedLayout,
      content: updatedContent
    });
  }

  handleSelectedCells(cell) {
    let updatedSelectedCells = this.state.selectedCells;
    if (updatedSelectedCells.includes(cell)) {
      updatedSelectedCells = updatedSelectedCells.filter(selectedCell => selectedCell !== cell)
    } else {
      updatedSelectedCells.push(cell);
    }
    this.setState({ selectedCells: updatedSelectedCells });
  }

  render() {
    const targetCells = []; // list of td that have a colspan or rowspan greater than 1

    return (
      <div className={style.tableContainer}>
        <table className={style.tableWrapper}>
          <tbody>
            {this.state.layout.map((row, rowIndex) => (
              <tr>
                {row.map((currentCell, cellIndex) => {
                  if (!isReferenceCell(targetCells, currentCell)) {
                    const rowSpan = this.computeRowSpan(rowIndex, cellIndex);
                    const colSpan = this.computeColSpan(rowIndex, cellIndex);
                    let contents = this.state.content[rowIndex][cellIndex];
                    if (colSpan !== 1 || rowSpan !== 1) {
                      targetCells.push(currentCell);
                      contents = this.getMergedCellContent(currentCell);
                    }
                    const content = contents.map(text => <div>{text}</div>)
                    return (
                      <td 
                        onClick={() => this.handleSelectedCells(currentCell)} 
                        colSpan={colSpan} 
                        rowSpan={rowSpan}
                        data-is-selected={this.state.selectedCells.includes(currentCell)}
                      >
                        {content}
                      </td>
                    )
                  } else {
                    return null;
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={style.tableActions}>
          <button onClick={() => this.addRow(this.getNumberOfRows() + 1)}>Add Row</button>
          <button onClick={() => this.deleteRow(this.getNumberOfRows())}>Delete Row</button>
          <button onClick={() => this.addColumn(this.getNumberOfCols() + 1)}>Add Column</button>
          <button onClick={() => this.deleteColumn(this.getNumberOfCols())}>Delete Column</button>
        </div>
      </div>
    )
  }
}

export default Table2;