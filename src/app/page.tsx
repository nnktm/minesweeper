'use client';

import DropdownList from '@/components/DropdownList';
import type { BoardSetting, LevelKey } from '@/constants';
import { LEVEL_KEYS, STANDARD_SETTINGS } from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

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
  customBoard: {
    width: number;
    height: number;
    bombCount: number;
  },
) {
  if (bombMap.flat().filter((num) => num === 1).length === customBoard.bombCount) {
    return bombMap;
  }
  if (userInputBoard.flat().filter((num) => num === -1).length !== 0) {
    return bombMap;
  }

  let bombCount = 0;
  const maxBombs = customBoard.bombCount;

  const newBombMap = structuredClone(bombMap);
  while (bombCount < maxBombs) {
    const cy = Math.floor(Math.random() * customBoard.height);
    const cx = Math.floor(Math.random() * customBoard.width);

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
  const [preferedDark, setPreferedDark] = useState(false);
  const [customSetting, setCustomSetting] = useState<BoardSetting>({
    width: 9,
    height: 9,
    bombCount: 10,
  });

  const boardSettings = useMemo(() => {
    return {
      ...STANDARD_SETTINGS,
      custom: customSetting,
    };
  }, [customSetting]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPreferedDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);
  const [selectedLevelKey, setSelectedLevelKey] = useState<LevelKey>(LEVEL_KEYS[0]);
  const handleOnSet = () => {
    if (customSetting.width < 1 || customSetting.height < 1 || customSetting.bombCount < 1) {
      alert('幅、高さ、爆弾数は1以上にしてください');
      return;
    }
    if (customSetting.width > 99 || customSetting.height > 99 || customSetting.bombCount > 500) {
      alert('幅、高さは99以下、爆弾数は500以下にしてください');
      return;
    }
    const initialBoard: number[][] = Array.from({ length: customSetting.height }, () =>
      Array.from({ length: customSetting.width }, () => 0),
    );
    setUserInputBoard(initialBoard);
    setBombMap(initialBoard);
    setTimer(0);
  };
  const [userInputBoard, setUserInputBoard] = useState<number[][]>(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0)),
  );
  const [bombMap, setBombMap] = useState<number[][]>(
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0)),
  );
  const [timer, setTimer] = useState(0);

  const handleOnSelect = (levelKey: LevelKey) => {
    setSelectedLevelKey(levelKey);
    setTimer(0);
    const boardSetting = boardSettings[levelKey];
    if (levelKey === 'custom') {
      setCustomSetting(boardSetting);
    }
    const newBoard = Array.from({ length: boardSetting.height }, () =>
      Array.from({ length: boardSetting.width }, () => 0),
    );
    setUserInputBoard(newBoard);
    setBombMap(newBoard);
  };

  const handleOnReset = () => {
    const initialBoard: number[][] = Array.from(
      { length: boardSettings[selectedLevelKey].height },
      () => Array.from({ length: boardSettings[selectedLevelKey].width }, () => 0),
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
      for (let cy = 0; cy < boardSettings[selectedLevelKey].height; cy++) {
        for (let cx = 0; cx < boardSettings[selectedLevelKey].width; cx++) {
          if (bombMap[cy][cx] === 1) {
            newUserInput[cy][cx] = 11;
          }
        }
      }
      newUserInput[y][x] = 21;
      setUserInputBoard(newUserInput);
      return;
    }
    const newBombMap = shuffleBombMap(
      y,
      x,
      bombMap,
      userInputBoard,
      boardSettings[selectedLevelKey],
    );
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
    userInputBoard.flat().filter((num) => num === 11 || num === 21).length ===
    boardSettings[selectedLevelKey].bombCount;

  const isGoodEnd =
    userInputBoard.flat().filter((num) => num === 0 || num === 10).length ===
    boardSettings[selectedLevelKey].bombCount;

  useEffect(() => {
    if (isBadEnd || isGoodEnd) {
      return;
    }
    if (
      bombMap.flat().filter((num) => num === 1).length === boardSettings[selectedLevelKey].bombCount
    ) {
      const timerId = setInterval(() => {
        setTimer((time) => time + 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [boardSettings, bombMap, isBadEnd, isGoodEnd, selectedLevelKey]);

  const restBombCount =
    boardSettings[selectedLevelKey].bombCount -
    userInputBoard.flat().filter((num) => num === 10).length;

  return (
    <div className={styles.container}>
      <div className={styles.gameContent}>
        <div className={styles.level}>
          <DropdownList levelKey={selectedLevelKey} onChange={handleOnSelect} />
        </div>
        {selectedLevelKey === 'custom' && (
          <div className={styles.customBoard}>
            <div className={styles.customBoardItem}>
              <label>
                <strong>幅</strong>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={customSetting.width}
                onChange={(e) => {
                  const newCustomSetting = { ...customSetting, width: Number(e.target.value) };
                  setCustomSetting(newCustomSetting);
                  setUserInputBoard(
                    Array.from({ length: newCustomSetting.height }, () =>
                      Array.from({ length: newCustomSetting.width }, () => 0),
                    ),
                  );
                }}
                className={styles.textBox}
              />
            </div>
            <div className={styles.customBoardItem}>
              <label>
                <strong>高さ</strong>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={customSetting.height}
                onChange={(e) => {
                  const newCustomSetting = { ...customSetting, height: Number(e.target.value) };
                  setCustomSetting(newCustomSetting);
                  setUserInputBoard(
                    Array.from({ length: newCustomSetting.height }, () =>
                      Array.from({ length: newCustomSetting.width }, () => 0),
                    ),
                  );
                }}
                className={styles.textBox}
              />
            </div>
            <div className={styles.customBoardItem}>
              <label>
                <strong>爆弾数</strong>
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={customSetting.bombCount}
                onChange={(e) => {
                  const newCustomSetting = { ...customSetting, bombCount: Number(e.target.value) };
                  setCustomSetting(newCustomSetting);
                  setUserInputBoard(
                    Array.from({ length: newCustomSetting.height }, () =>
                      Array.from({ length: newCustomSetting.width }, () => 0),
                    ),
                  );
                }}
                className={styles.textBox}
              />
            </div>
            <button onClick={handleOnSet} className={styles.setButton}>
              更新
            </button>
          </div>
        )}
        <div className={styles.game}>
          <div
            className={styles.info}
            style={{ width: ` ${boardSettings[selectedLevelKey].width * 30 + 8}px` }}
          >
            <div className={styles.bombCount}>
              <div
                className={styles.timerItem}
                style={
                  restBombCount / 100 > 0
                    ? { backgroundPositionX: `${Math.floor(restBombCount / 100) * -27.5}px` }
                    : { backgroundPositionX: '0px' }
                }
              />
              <div
                className={styles.timerItem}
                style={
                  restBombCount / 10 > 0
                    ? { backgroundPositionX: `${Math.floor((restBombCount % 100) / 10) * -27.5}px` }
                    : { backgroundPositionX: '0px' }
                }
              />
              <div
                className={styles.timerItem}
                style={
                  restBombCount % 10 > 0
                    ? { backgroundPositionX: `${(restBombCount % 10) * -27.5}px` }
                    : { backgroundPositionX: '0px' }
                }
              />
            </div>
            <div
              className={styles.smile}
              onClick={handleOnReset}
              style={{ backgroundPositionX: isBadEnd ? '-390px' : isGoodEnd ? '-360px' : '-330px' }}
            />
            <div className={styles.timer}>
              <div
                className={styles.timerItem}
                style={
                  timer / 100 > 0
                    ? { backgroundPositionX: `${Math.floor(timer / 100) * -27.5}px` }
                    : { backgroundPositionX: '0px' }
                }
              />
              <div
                className={styles.timerItem}
                style={
                  timer / 10 > 0
                    ? { backgroundPositionX: `${Math.floor((timer % 100) / 10) * -27.5}px` }
                    : { backgroundPositionX: '0px' }
                }
              />
              <div
                className={styles.timerItem}
                style={
                  timer % 10 > 0
                    ? { backgroundPositionX: `${(timer % 10) * -27.5}px` }
                    : { backgroundPositionX: '0px' }
                }
              />
            </div>
          </div>
          <div
            className={styles.board}
            style={{
              gridTemplateRows: `repeat(${boardSettings[selectedLevelKey].height}, 30px)`,
              gridTemplateColumns: `repeat(${boardSettings[selectedLevelKey].width}, 30px)`,
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
                    style={{ backgroundColor: preferedDark ? '#444e56' : '#c6c6c6' }}
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
    </div>
  );
};

export default Home;
