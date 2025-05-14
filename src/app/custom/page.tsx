'use client';

import { useEffect, useState } from 'react';
import styles from '../page4.module.css';

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

function shuffleBombMap(
  y: number,
  x: number,
  bombMap: number[][],
  userInputBoard: number[][],
  customBoard: number[],
) {
  if (userInputBoard.flat().filter((num) => num === -1).length !== 0) {
    return bombMap;
  }
  if (bombMap.flat().filter((num) => num === 1).length === 10) {
    return bombMap;
  }

  const newBombMap = structuredClone(bombMap);
  let bombCount = 0;
  const maxBombs = customBoard[2];

  while (bombCount < maxBombs) {
    const cy = Math.floor(Math.random() * customBoard[1]);
    const cx = Math.floor(Math.random() * customBoard[0]);

    if (cy === y && cx === x) continue;

    if (newBombMap[cy][cx] === 0) {
      newBombMap[cy][cx] = 1;
      bombCount++;
    }
  }

  return newBombMap;
}

const checkBomCount = (cy: number, cx: number, board: number[][]) => {
  let countBom = 0;
  for (const [dx, dy] of DIRECTIONS) {
    if (board[cy + dy] === undefined || board[cy + dy][cx + dx] === undefined) continue;
    if (board[cy + dy][cx + dx] === 1) countBom++;
  }
  return countBom;
};

const Home = () => {
  const [customBoard, setCustomBoard] = useState([10, 10, 15]);
  const handleOnSet = () => {
    if (customBoard[0] < 1 || customBoard[1] < 1 || customBoard[2] < 1) {
      alert('幅、高さ、爆弾数は1以上にしてください');
      return;
    }
    const initialBoard: number[][] = Array.from({ length: customBoard[1] }, () =>
      Array.from({ length: customBoard[0] }, () => 0),
    );
    setUserInputBoard(initialBoard);
    setBombMap(initialBoard);
  };
  const [userInputBoard, setUserInputBoard] = useState<number[][]>([]);
  const [bombMap, setBombMap] = useState<number[][]>([]);
  const [timer, setTimer] = useState(0);

  const handleOnReset = () => {
    const initialBoard: number[][] = Array.from({ length: customBoard[1] }, () =>
      Array.from({ length: customBoard[0] }, () => 0),
    );
    setUserInputBoard(initialBoard);
    setBombMap(initialBoard);
    setTimer(0);
  };

  const handleOnClick = (e: React.MouseEvent, y: number, x: number) => {
    if (isBadEnd || isGoodEnd) return;
    if (userInputBoard[y][x] === -1) return;
    const newUserInput = structuredClone(userInputBoard);
    if (e.button === 2) {
      if (newUserInput[y][x] === 10) {
        newUserInput[y][x] = 9;
      } else if (newUserInput[y][x] === 9) {
        newUserInput[y][x] = 0;
      } else {
        newUserInput[y][x] = 10;
      }
      setUserInputBoard(newUserInput);
      return;
    }

    if (bombMap[y][x] === 1) {
      for (let cy = 0; cy < customBoard[1]; cy++) {
        for (let cx = 0; cx < customBoard[0]; cx++) {
          if (bombMap[cy][cx] === 1) {
            newUserInput[cy][cx] = 11;
          }
        }
      }
      newUserInput[y][x] = 21;
      setUserInputBoard(newUserInput);
      return;
    }
    const newBombMap = shuffleBombMap(y, x, bombMap, userInputBoard, customBoard);
    setBombMap(newBombMap);
    console.log(newBombMap);

    if (newBombMap[y][x] === 0) {
      if (userInputBoard[y][x] === 0) {
        const zeroCell: [number, number][] = [];

        const checkCell = (cy: number, cx: number) => {
          if (zeroCell.some(([x, y]) => x === cx && y === cy)) return;

          if (newBombMap[cy][cx] !== 0) return;

          let hasBomb = false;
          for (const [dx, dy] of DIRECTIONS) {
            if (newBombMap[cy + dy] === undefined || newBombMap[cy + dy][cx + dx] === undefined)
              continue;
            if (newBombMap[cy + dy][cx + dx] === 1) {
              hasBomb = true;
              newUserInput[cy][cx] = checkBomCount(cy, cx, newBombMap);
              break;
            }
          }

          if (!hasBomb) {
            zeroCell.push([cx, cy]);
            for (const [dx, dy] of DIRECTIONS) {
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
        setUserInputBoard(newUserInput);
      }
    }
    console.log(newUserInput);
  };
  const isBadEnd =
    userInputBoard.flat().filter((num) => num === 11 || num === 21).length === customBoard[2];

  const isGoodEnd =
    userInputBoard.flat().filter((num) => num === 0 || num === 10).length === customBoard[2];

  useEffect(() => {
    if (isBadEnd || isGoodEnd) {
      return;
    }
    if (bombMap.flat().filter((num) => num === 1).length === customBoard[2]) {
      const timerId = setInterval(() => {
        setTimer((time) => time + 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [bombMap, isBadEnd, isGoodEnd, customBoard]);

  return (
    <div className={styles.container}>
      <div className={styles.link}>
        <a href="/">初級</a>
        <a href="/page2">中級</a>
        <a href="/page3">上級</a>
        <a href="/custom">カスタム</a>
      </div>
      <div className={styles.custom}>
        <div className={styles.customBoard}>
          <div className={styles.customBoardItem}>
            <p>
              <strong>幅</strong>
            </p>
            <input
              type="number"
              min="1"
              value={customBoard[0]}
              onChange={(e) =>
                setCustomBoard([Number(e.target.value), customBoard[1], customBoard[2]])
              }
              className={styles.textBox}
            />
          </div>
          <div className={styles.customBoardItem}>
            <p>
              <strong>高さ</strong>
            </p>
            <input
              type="number"
              min="1"
              value={customBoard[1]}
              onChange={(e) =>
                setCustomBoard([customBoard[0], Number(e.target.value), customBoard[2]])
              }
              className={styles.textBox}
            />
            <div className={styles.customBoardItem}>
              <p>
                <strong>爆弾数</strong>
              </p>
              <input
                type="number"
                min="1"
                value={customBoard[2]}
                onChange={(e) =>
                  setCustomBoard([customBoard[0], customBoard[1], Number(e.target.value)])
                }
                className={styles.textBox}
              />
            </div>
            <button onClick={handleOnSet}>更新</button>
          </div>
        </div>
      </div>
      <div className={styles.game}>
        <div className={styles.info}>
          <div className={styles.bombCount}>
            {customBoard[2] - userInputBoard.flat().filter((num) => num === 10).length}
          </div>
          <div
            className={styles.smile}
            onClick={handleOnReset}
            style={{ backgroundPositionX: isBadEnd ? '-395px' : isGoodEnd ? '-365px' : '-335px' }}
          />
          <div className={styles.timer}>{timer}</div>
        </div>
        <div
          className={styles.board}
          style={{
            gridTemplateRows: `repeat(${customBoard[1]}, 30px)`,
            gridTemplateColumns: `repeat(${customBoard[0]}, 30px)`,
          }}
        >
          {userInputBoard.map((row, y) =>
            row.map((col, x) =>
              col === 0 ? (
                <div
                  key={`${x}-${y}`}
                  className={styles.cover}
                  onClick={(e) => {
                    e.preventDefault();
                    handleOnClick(e, y, x);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleOnClick(e, y, x);
                  }}
                  style={{ backgroundColor: '#c6c6c6' }}
                />
              ) : col === 10 || col === 9 ? (
                <div
                  key={`${x}-${y}`}
                  className={styles.flag}
                  onClick={(e) => {
                    e.preventDefault();
                    handleOnClick(e, y, x);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleOnClick(e, y, x);
                  }}
                  style={{
                    backgroundPositionX: col === 10 ? `-178px ` : `-158px`,
                  }}
                />
              ) : col === 11 ? (
                <div
                  key={`${x}-${y}`}
                  className={styles.cell}
                  style={{ backgroundPositionX: '-300px' }}
                />
              ) : col === 21 ? (
                <div
                  key={`${x}-${y}`}
                  className={styles.cell}
                  style={{ backgroundPositionX: '-300px', backgroundColor: '#ef0000' }}
                />
              ) : (
                <div
                  key={`${x}-${y}`}
                  className={styles.cell}
                  style={{
                    backgroundPositionX: col === -1 ? '30px' : `${(col - 1) * -30}px`,
                  }}
                />
              ),
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
