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

const Home = () => {
  const [userInputBoard, setUserInputBoard] = useState(initialBoard);
  const [bombMap, setBombMap] = useState(initialBoard);

  const handleOnClick = (y: number, x: number) => {
    if (bombMap[y][x] === 1 || bombMap[y][x] === -1) return;

    const newBombMap = shuffleBombMap(y, x, bombMap, userInputBoard);
    setBombMap(newBombMap);
    console.log(newBombMap);

    const newUserInput = structuredClone(userInputBoard);
    if (newBombMap[y][x] === 0) {
      const zeroCell: [number, number][] = [];

      const checkCell = (cy: number, cx: number) => {
        if (zeroCell.some(([x, y]) => x === cx && y === cy)) return;

        if (newBombMap[cy][cx] !== 0) return;

        let hasBomb = false;
        for (const direction of DIRECTIONS) {
          const dx = direction[0];
          const dy = direction[1];
          if (newBombMap[cy + dy] === undefined || newBombMap[cy + dy][cx + dx] === undefined)
            continue;
          if (newBombMap[cy + dy][cx + dx] === 1) {
            hasBomb = true;
            break;
          }
        }

        if (!hasBomb) {
          zeroCell.push([cx, cy]);
          for (const direction of DIRECTIONS) {
            const dx = direction[0];
            const dy = direction[1];
            if (newBombMap[cy + dy] === undefined || newBombMap[cy + dy][cx + dx] === undefined)
              continue;
            if (newBombMap[cy + dy][cx + dx] === 0) {
              checkCell(cy + dy, cx + dx);
            }
          }
        }
      };

      checkCell(y, x);

      for (const [x, y] of zeroCell) {
        newUserInput[y][x] = -1;
      }
    }
    if (userInputBoard.flat().filter((num) => num === -1).length !== 0) {
      for (let cy = 0; cy < 9; cy++) {
        for (let cx = 0; cx < 9; cx++) {
          if (userInputBoard[cy][cx] === -1) {
            newUserInput[cy][cx] = checkBomCount(cy, cx, bombMap);
          }
        }
      }
      setUserInputBoard(newUserInput);
    }
    console.log(newUserInput);
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
                  backgroundPositionX: `${color * -22.5}px`,
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
