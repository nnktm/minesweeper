'use client';

import { useState } from 'react';
import styles from './page.module.css';

const initialBoard = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const DIRECTIONS = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

function shuffleBombMap(y: number, x: number, bombMap: number[][], userInputBoard: number[][]) {
  if (userInputBoard.flat().filter((num) => num === -1).length !== 0) {
    return bombMap;
  }
  if (bombMap.flat().filter((num) => num === 1).length === 10) {
    return bombMap;
  }

  const newBombMap = structuredClone(bombMap);
  let bombCount = 0;
  const maxBombs = 10;

  while (bombCount < maxBombs) {
    const cy = Math.floor(Math.random() * 9);
    const cx = Math.floor(Math.random() * 9);

    if (cy === y && cx === x) continue;
    if (Math.abs(cy - y) <= 1 && Math.abs(cx - x) <= 1) continue;

    if (newBombMap[cy][cx] === 0) {
      newBombMap[cy][cx] = 1;
      bombCount++;
    }
  }

  return newBombMap;
}

const checkBomCount = (cy: number, cx: number, board: number[][]) => {
  let countBom = 0;
  for (const direction of DIRECTIONS) {
    const dx = direction[0];
    const dy = direction[1];
    if (board[cy + dy] === undefined) continue;
    if (board[cy + dy][cx + dx] === 1) countBom++;
  }
  return countBom;
};

// const checkZeroRoup = (y: number, x: number, newBombMap: number[][]) => {
//   const newUserInputBoard = structuredClone(newBombMap);
//   if (newBombMap[y][x] !== 0) return;
//   const zeroCell: [number, number][] = [];
//   const visited = new Set<string>();

//   const checkCell = (cy: number, cx: number) => {
//     const key = `${cy},${cx}`;
//     if (visited.has(key)) return;
//     visited.add(key);

//     if (newBombMap[cy][cx] !== 0) return;

//     for (const direction of DIRECTIONS) {
//       const dx = direction[0];
//       const dy = direction[1];
//       if (newBombMap[cy + dy] === undefined) continue;
//       if (newBombMap[cy + dy][cx + dx] === 0) {
//         zeroCell.push([cx + dx, cy + dy]);
//         checkCell(cy + dy, cx + dx);
//       }
//     }
//   };

//   checkCell(y, x);

//   for (const [x, y] of zeroCell) {
//     newUserInputBoard[y][x] = -1;
//   }

//   return true;
// };

const Home = () => {
  const [userInputBoard, setUserInputBoard] = useState(initialBoard);
  const [bombMap, setBombMap] = useState(initialBoard);

  const handleOnClick = (y: number, x: number) => {
    console.log(bombMap);
    console.log(userInputBoard);

    if (bombMap[y][x] === 1 || bombMap[y][x] === -1) return;

    const newBombMap = shuffleBombMap(y, x, bombMap, userInputBoard);
    setBombMap(newBombMap);

    // const newUserInput = structuredClone(userInputBoard);
    // if (newBombMap[y][x] === 0) {
    //   if (checkZeroRoup(y, x, newBombMap)) {
    //     newUserInput[y][x] = -1;
    //   }
    //   setUserInputBoard(newUserInput);
    // }
    const viewBoard = structuredClone(userInputBoard);
    if (userInputBoard.flat().filter((num) => num === -1).length !== 0) {
      for (let cy = 0; cy < 9; cy++) {
        for (let cx = 0; cx < 9; cx++) {
          if (userInputBoard[cy][cx] === -1) {
            viewBoard[cy][cx] = checkBomCount(cy, cx, bombMap);
          }
        }
      }
    }
    setUserInputBoard(viewBoard);
  };

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {userInputBoard.map((row, y) =>
          row.map((color, x) => (
            <div key={`${x}-${y}`} className={styles.cell} onClick={() => handleOnClick(y, x)}>
              <div
                className={styles.stone}
                style={{
                  backgroundPositionX: userInputBoard[y][x] === -1 ? `${color * -22.5}px` : '30px',
                }}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
};

export default Home;
