import React, { useState } from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = {
  BOX: "box",
};

const BlockTypes = {
  Single: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  T: {
    left: 1,
    right: 1,
    top: 0,
    bottom: 1
  },
  L: {
    left: 0,
    right: 1,
    top: 2,
    bottom: 0
  },
  I: {
    left: 0,
    right: 0,
    top: 1,
    bottom: 2
  }
}

const DraggableItem = ({ id, color, blockType, handleHover }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: { id, color, blockType, onHover: handleHover },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          handleHover(10, 10, item.blockType);
        }
      },
    }),
    [id, color, blockType]
  );

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0 : 1,
        backgroundColor: color,
      }}
      className="m-2 cursor-grab w-12 h-12"
    >
      {blockType}
    </div>
  );
};

const cellGridColor = (color) => {
  switch (color) {
    case "blue":
      return "bg-blue-500";
    case "red":
      return "bg-red-500";
    case "yellow":
      return "bg-yellow-500";
    case "green":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const CellGrid = ({ onDrop, row, col, color, isOverBlock, isFilled }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.BOX,
    drop: (item) => onDrop(row, col, item.color, item.id, item.blockType),
    hover: (item, monitor) => {
      if (monitor.isOver()) {
        item.onHover(row, col, item.blockType)
      } else {
        item.onHover(10, 10, item.blockType)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`aspect-square border border-black h-full w-full transition-colors duration-200 ${(isOverBlock || isOver) ? isFilled ? "bg-orange-500" : "bg-white" : cellGridColor(
        color
      )}`}
    ></div>
  );
};

const DropGrid = ({ handleDrop, cellColor, hoveredCells, filledCells }) => {
  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-0 h-64 w-64">
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => (
          <CellGrid
            color={cellColor[row][col]}
            key={`${row}-${col}`}
            onDrop={handleDrop}
            row={row}
            col={col}
            isOverBlock={hoveredCells[row][col]}
            isFilled={filledCells[row][col]}
          />
        ))
      )}
    </div>
  );

};


const DragAndDropComponent = () => {
  const [currentColor, setCurrentColor] = useState([
    "blue",
    "red",
    "yellow",
    "green",
  ]);
  const [cellColor, setCellColor] = useState(Array.from({ length: 5 }, () => Array(5).fill("gray")));
  const [hoveredCells, setHoveredCells] = useState(Array.from({ length: 5 }, () => Array(5).fill(false)));
  const [filledCells, setFilledCells] = useState(Array.from({ length: 5 }, () => Array(5).fill(false)));

  const handleHover = (row, col, blockType) => {
    const element = BlockTypes[blockType];
    var newCells = Array.from({ length: 5 }, () => Array(5).fill(false));
    if (col - element.left >= 0 && col + element.right <= 4 && row - element.top >= 0 && row + element.bottom <= 4) {
      newCells[row][col] = true;
      for (let i = 0; i < element.left; i++) {
        newCells[row][col - i - 1] = true;
      }
      for (let i = 0; i < element.right; i++) {
        newCells[row][col + i + 1] = true;
      }
      for (let i = 0; i < element.top; i++) {
        newCells[row - i - 1][col] = true;
      }
      for (let i = 0; i < element.bottom; i++) {
        newCells[row + i + 1][col] = true;
      }
    }
    setHoveredCells(newCells);
  }

  const checkIfFilled = (row, col, blockType) => {
    const element = BlockTypes[blockType];
    if (filledCells[row][col]) {
      return false;
    }
    for (let i = 0; i < element.left; i++) {
      if (filledCells[row][col - i - 1]) {
        return false;
      }
    }
    for (let i = 0; i < element.right; i++) {
      if (filledCells[row][col + i + 1]) {
        return false;
      }
    }
    for (let i = 0; i < element.top; i++) {
      if (filledCells[row - i - 1][col]) {
        return false;
      }
    }
    for (let i = 0; i < element.bottom; i++) {
      if (filledCells[row + i + 1][col]) {
        return false;
      }
    }
    return true;
  }

  const handleDrop = (row, col, color, id, blockType) => {
    setCellColor((prevColors) => {
      const newColors = [...prevColors];
      const element = BlockTypes[blockType];
      if (checkIfFilled(row, col, blockType) && col - element.left >= 0 && col + element.right <= 4 && row - element.top >= 0 && row + element.bottom <= 4) {
        newColors[row][col] = color;
        for (let i = 0; i < element.left; i++) {
          newColors[row][col - i - 1] = color;
        }
        for (let i = 0; i < element.right; i++) {
          newColors[row][col + i + 1] = color;
        }
        for (let i = 0; i < element.top; i++) {
          newColors[row - i - 1][col] = color;
        }
        for (let i = 0; i < element.bottom; i++) {
          newColors[row + i + 1][col] = color;
        }
        setCurrentColor((prevColor) => {
          const colorCycle = {
            blue: "red",
            red: "yellow",
            yellow: "green",
            green: "blue",
          };
          var newColor = [...prevColor];
          newColor[id] = colorCycle[prevColor[id]];
          return newColor;
        });
        setFilledCells(prevCells => {
          var newCells = [...prevCells];
          const element = BlockTypes[blockType];
          if (col - element.left >= 0 && col + element.right <= 4 && row - element.top >= 0 && row + element.bottom <= 4) {
            newCells[row][col] = true;
            for (let i = 0; i < element.left; i++) {
              newCells[row][col - i - 1] = true;
            }
            for (let i = 0; i < element.right; i++) {
              newCells[row][col + i + 1] = true;
            }
            for (let i = 0; i < element.top; i++) {
              newCells[row - i - 1][col] = true;
            }
            for (let i = 0; i < element.bottom; i++) {
              newCells[row + i + 1][col] = true;
            }
          }
          return newCells;
        })

      }
      return newColors;
    });
    setHoveredCells(Array.from({ length: 5 }, () => Array(5).fill(false)));
  };

  return (
    <div className="flex flex-wrap justify-around p-20">
      <div>
        <DraggableItem id="0" color={currentColor[0]} blockType="Single" handleHover={handleHover} />
        <DraggableItem id="1" color={currentColor[1]} blockType="T" handleHover={handleHover} />
        <DraggableItem id="2" color={currentColor[2]} blockType="I" handleHover={handleHover} />
        <DraggableItem id="3" color={currentColor[3]} blockType="L" handleHover={handleHover} />
      </div>
      <DropGrid cellColor={cellColor} handleDrop={handleDrop} hoveredCells={hoveredCells} filledCells={filledCells} />
      <div>
        humble beginings, now i need to:
        fortify borders of item,
        display item on left,
        make sure items wont overlap,
        make sure items wont escape boundries,
        items on left start from center ? (try and error if fits, when center changes?, maybe create starting point and change it to the end? weird with T and L, maybe the method is flawed from the begining, because how will i highlight all 4 elements at once ????)
        border of items? null table with unique index of item and if id != id, setup borde
      </div>
    </div>
  );
};

export default DragAndDropComponent;
