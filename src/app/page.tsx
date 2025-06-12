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
  customBoard: {
    width: number;
    height: number;
    bombCount: number;
  },
) =>
  Array.from({ length: customBoard.bombCount }, () => {
    const [cy, cx] = (() => {
      let cy: number, cx: number;
      do {
        cy = Math.floor(Math.random() * customBoard.height);
        cx = Math.floor(Math.random() * customBoard.width);
      } while ((cy === y && cx === x) || bombMap[cy][cx] === 1);
      return [cy, cx];
    })();
    bombMap[cy][cx] = 1;
    return bombMap;
  }).pop() || structuredClone(bombMap);

const checkBomCount = (cy: number, cx: number, board: number[][]) =>
  DIRECTIONS.filter(([dx, dy]) => board[cy + dy]?.[cx + dx] === 1).length;

const calcBoard = (userInputBoard: number[][], bombMap: number[][]) => {
  const board = Array.from({ length: userInputBoard.length }, () =>
    Array.from({ length: userInputBoard[0].length }, () => 0),
  );
  if (userInputBoard.length !== userInputBoard[0].length) return board;
  const bombExplosionCell: [number, number][] = [];
  let bombExplosion = false;
  const clickBombExplosionCell: [number, number][] = [];
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
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
    levelKey === 'custom' ? setCustomSetting(boardSetting) : null;

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

  const handleOnContextMenu = (e: React.MouseEvent, y: number, x: number) => {
    e.preventDefault();
    const newUserInput = structuredClone(userInputBoard);
    gameStatus === 'playing'
      ? ((newUserInput[y][x] = (newUserInput[y][x] + 1) % 3), setUserInputBoard(newUserInput))
      : null;
  };

  const handleOnClick = (e: React.MouseEvent, y: number, x: number) => {
    e.preventDefault();
    const newUserInput = structuredClone(userInputBoard);
    if (gameStatus === 'badEnd' || gameStatus === 'goodEnd') return;
    if (newUserInput[y][x] !== 0) return;
    if (gameStatus === 'waiting') {
      const newBombMap = shuffleBombMap(y, x, bombMap, boardSettings[selectedLevelKey]);
      setBombMap(newBombMap);
    }
    newUserInput[y][x] = 3;
    setUserInputBoard(newUserInput);
  };

  useEffect(() => {
    setPreferedDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    const timerId =
      gameStatus === 'playing'
        ? setInterval(() => {
            setTimer((time) => time + 1);
          }, 1000)
        : undefined;
    return () => timerId && clearInterval(timerId);
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
                  Number(e.target.value) * customSetting.height <
                  boardSettings[selectedLevelKey].bombCount
                    ? alert(
                        `幅と高さの積(${Number(e.target.value) * customSetting.height})は爆弾数(${boardSettings[selectedLevelKey].bombCount})より大きくしてください`,
                      )
                    : Number(e.target.value) > 99
                      ? alert(`幅は99以下にしてください（現在の値: ${Number(e.target.value)}）`)
                      : (() => {
                          const newCustomSetting = {
                            ...customSetting,
                            width: Number(e.target.value),
                          };
                          setCustomSetting(newCustomSetting);
                          setUserInputBoard(
                            Array.from({ length: newCustomSetting.height }, () =>
                              Array.from({ length: newCustomSetting.width }, () => 0),
                            ),
                          );
                        })();
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
                  Number(e.target.value) * customSetting.width <
                  boardSettings[selectedLevelKey].bombCount
                    ? alert(
                        `幅と高さの積(${Number(e.target.value) * customSetting.width})は爆弾数(${boardSettings[selectedLevelKey].bombCount})より大きくしてください`,
                      )
                    : Number(e.target.value) > 99
                      ? alert(`高さは99以下にしてください（現在の値: ${Number(e.target.value)}）`)
                      : (() => {
                          const newCustomSetting = {
                            ...customSetting,
                            height: Number(e.target.value),
                          };
                          setCustomSetting(newCustomSetting);
                          setUserInputBoard(
                            Array.from({ length: newCustomSetting.height }, () =>
                              Array.from({ length: newCustomSetting.width }, () => 0),
                            ),
                          );
                        })();
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
                  Number(e.target.value) > customSetting.width * customSetting.height - 1
                    ? alert(
                        `爆弾数はマスの数(${customSetting.width * customSetting.height})より少なくしてください（現在の値: ${Number(e.target.value)}）`,
                      )
                    : Number(e.target.value) < 1
                      ? alert(`爆弾数は1以上にしてください（現在の値: ${Number(e.target.value)}）`)
                      : (() => {
                          const newCustomSetting = {
                            ...customSetting,
                            bombCount: Number(e.target.value),
                          };
                          setCustomSetting(newCustomSetting);
                          setUserInputBoard(
                            Array.from({ length: newCustomSetting.height }, () =>
                              Array.from({ length: newCustomSetting.width }, () => 0),
                            ),
                          );
                        })();
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
              {[
                restBombCount / 100 > 0 ? Math.floor(restBombCount / 100) * -27.5 : 0,
                restBombCount / 10 > 0 ? Math.floor((restBombCount % 100) / 10) * -27.5 : 0,
                restBombCount % 10 > 0 ? (restBombCount % 10) * -27.5 : 0,
              ].map((m, i) => (
                <div
                  key={`${i}-${m}`}
                  className={styles.timerItem}
                  style={{ backgroundPositionX: `${m}px` }}
                />
              ))}
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
              {[
                timer / 100 > 0 ? Math.floor(timer / 100) * -27.5 : 0,
                timer / 10 > 0 ? Math.floor((timer % 100) / 10) * -27.5 : 0,
                timer % 10 > 0 ? (timer % 10) * -27.5 : 0,
              ].map((m, i) => (
                <div
                  key={`${i}-${m}`}
                  className={styles.timerItem}
                  style={{ backgroundPositionX: `${m}px` }}
                />
              ))}
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
                return col === 0 || col === 10 || col === 9 ? (
                  <div
                    key={`${x}-${y}`}
                    className={styles.cover}
                    onClick={(e) => {
                      handleOnClick(e, y, x);
                    }}
                    onContextMenu={(e) => {
                      handleOnContextMenu(e, y, x);
                    }}
                    style={
                      col === 0
                        ? {
                            backgroundColor: preferedDark ? '#444e56' : '#c6c6c6',
                            backgroundPositionX: '30px',
                          }
                        : { backgroundPositionX: col === 10 ? `-178px ` : `-158px` }
                    }
                  />
                ) : (
                  <div
                    key={`${x}-${y}`}
                    className={styles.cell}
                    style={
                      col === 11 || col === 21
                        ? {
                            backgroundPositionX: '-300px',
                            backgroundColor: col === 21 ? '#ef0000' : '',
                          }
                        : { backgroundPositionX: col === -1 ? '30px' : `${(col - 1) * -30}px` }
                    }
                  />
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
