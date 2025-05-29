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

const shuffleBombMap = (
  y: number,
  x: number,
  bombMap: number[][],
  userInputBoard: number[][],
  customBoard: {
    width: number;
    height: number;
    bombCount: number;
  },
) => {
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
};

const checkBomCount = (cy: number, cx: number, board: number[][]) => {
  let countBom = 0;
  for (const [dx, dy] of DIRECTIONS) {
    if (board[cy + dy] === undefined || board[cy + dy][cx + dx] === undefined) continue;
    if (board[cy + dy][cx + dx] === 1) countBom++;
  }
  return countBom;
};

const calcBoard = (userInputBoard: number[][], bombMap: number[][]) => {
  const board = Array.from({ length: userInputBoard.length }, () =>
    Array.from({ length: userInputBoard[0].length }, () => 0),
  );
  const bombExplosionCell: [number, number][] = [];
  let bombExplosion = false;
  const clickBombExplosionCell: [number, number][] = [];
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (userInputBoard[y] === undefined || userInputBoard[y][x] === undefined) continue;
      if (bombMap[y][x] === 1) {
        bombExplosionCell.push([x, y]);
      }
      if (userInputBoard[y][x] === 3) {
        if (bombMap[y][x] === 1) {
          bombExplosion = true;
          clickBombExplosionCell.push([x, y]);
        }
        if (board[y][x] === 0) {
          const zeroCell: [number, number][] = [];

          const checkCell = (cy: number, cx: number) => {
            if (zeroCell.some(([x, y]) => x === cx && y === cy)) return;
            if (board[cy] === undefined || board[cy][cx] === undefined) return;
            if (bombMap[cy][cx] !== 0) return;
            let hasBomb = false;
            for (const [dx, dy] of DIRECTIONS) {
              if (bombMap[cy + dy] === undefined || bombMap[cy + dy][cx + dx] === undefined)
                continue;
              if (bombMap[cy + dy][cx + dx] === 1) {
                hasBomb = true;
                board[cy][cx] = checkBomCount(cy, cx, bombMap);
                break;
              }
            }
            if (!hasBomb) {
              zeroCell.push([cx, cy]);
              for (const [dx, dy] of DIRECTIONS) {
                if (bombMap[cy + dy] === undefined || bombMap[cy + dy][cx + dx] === undefined)
                  continue;
                if (bombMap[cy + dy][cx + dx] === 0) {
                  checkCell(cy + dy, cx + dx);
                }
              }
            }
          };

          checkCell(y, x);
          for (const [x, y] of zeroCell) {
            board[y][x] = -1;
          }
        }
      }
      if (userInputBoard[y][x] === 1) {
        board[y][x] = 10;
      }
      if (userInputBoard[y][x] === 2) {
        board[y][x] = 9;
      }
    }
  }
  if (bombExplosion) {
    for (const [cx, cy] of bombExplosionCell) {
      board[cy][cx] = 11;
    }
    for (const [cx, cy] of clickBombExplosionCell) {
      board[cy][cx] = 21;
    }
  }
  return board;
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

  const [selectedLevelKey, setSelectedLevelKey] = useState<LevelKey>(LEVEL_KEYS[0]);
  const handleOnSet = () => {
    if (customSetting.width < 1 || customSetting.height < 1 || customSetting.bombCount < 1) {
      alert('幅、高さ、爆弾数は1以上にしてください');
      return;
    }
    if (
      customSetting.width > 99 ||
      customSetting.height > 99 ||
      customSetting.bombCount > customSetting.width * customSetting.height - 1
    ) {
      alert('幅、高さは99以下、爆弾数はマスの数より少なくしてください');
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
  const board = calcBoard(userInputBoard, bombMap);

  const gameStatus: 'badEnd' | 'goodEnd' | 'waiting' | 'playing' = useMemo(() => {
    if (
      board.flat().filter((num) => num === 0).length ===
      boardSettings[selectedLevelKey].width * boardSettings[selectedLevelKey].height
    ) {
      return 'waiting';
    }
    if (
      board.flat().filter((num) => num === 0 || num === 10).length ===
      boardSettings[selectedLevelKey].bombCount
    ) {
      return 'goodEnd';
    }
    if (
      board.flat().filter((num) => num === 11 || num === 21).length ===
      boardSettings[selectedLevelKey].bombCount
    ) {
      return 'badEnd';
    }
    return 'playing';
  }, [board, boardSettings, selectedLevelKey]);

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
    console.log(gameStatus);
    const initialBoard: number[][] = Array.from(
      { length: boardSettings[selectedLevelKey].height },
      () => Array.from({ length: boardSettings[selectedLevelKey].width }, () => 0),
    );
    setUserInputBoard(initialBoard);
    setBombMap(initialBoard);
    setTimer(0);
  };

  const handleOnClick = (e: React.MouseEvent, y: number, x: number) => {
    const newUserInput = structuredClone(userInputBoard);
    if (gameStatus === 'badEnd' || gameStatus === 'goodEnd') return;
    if (e.button === 2) {
      newUserInput[y][x] = (newUserInput[y][x] + 1) % 3;
      setUserInputBoard(newUserInput);
      return;
    }
    if (newUserInput[y][x] !== 0) return;
    if (gameStatus === 'waiting') {
      const newBombMap = shuffleBombMap(
        y,
        x,
        bombMap,
        userInputBoard,
        boardSettings[selectedLevelKey],
      );
      setBombMap(newBombMap);
    }

    newUserInput[y][x] = 3;
    setUserInputBoard(newUserInput);
  };

  useEffect(() => {
    setPreferedDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing') {
      const timerId = setInterval(() => {
        setTimer((time) => time + 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [gameStatus]);

  const restBombCount =
    boardSettings[selectedLevelKey].bombCount - board.flat().filter((num) => num === 10).length;

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
                max={customSetting.width * customSetting.height - 1}
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
              style={{
                backgroundPositionX:
                  gameStatus === 'badEnd'
                    ? '-390px'
                    : gameStatus === 'goodEnd'
                      ? '-360px'
                      : '-330px',
              }}
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
            {board.map((row, y) =>
              row.map((col, x) => {
                // クリック可能なセル
                if (col === 0 || col === 10 || col === 9) {
                  return (
                    <div key={`${x}-${y}`} className="canClick">
                      {col === 0 ? (
                        <div
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
                      ) : (
                        <div
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
                      )}
                    </div>
                  );
                }

                // クリック不可能なセル
                return (
                  <div key={`${x}-${y}`} className="cantClick">
                    {col === 11 || col === 21 ? (
                      <div
                        className={styles.cell}
                        style={{
                          backgroundPositionX: '-300px',
                          ...(col === 21 && { backgroundColor: '#ef0000' }),
                        }}
                      />
                    ) : (
                      <div
                        className={styles.cell}
                        style={{
                          backgroundPositionX: col === -1 ? '30px' : `${(col - 1) * -30}px`,
                        }}
                      />
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
