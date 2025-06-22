'use client';

import Board from '@/components/Board';
import CustomSetting from '@/components/CustomSetting';
import DropdownList from '@/components/DropdownList';
import Info from '@/components/Info';
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

  type GameStatus = 'badEnd' | 'goodEnd' | 'waiting' | 'playing';

  const gameStatus: GameStatus = useMemo(() => {
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
    gameStatus === 'badEnd' || gameStatus === 'goodEnd'
      ? null
      : newUserInput[y][x] !== 0
        ? null
        : gameStatus === 'waiting'
          ? (() => {
              const newBombMap = shuffleBombMap(y, x, bombMap, boardSettings[selectedLevelKey]);
              setBombMap(newBombMap);
              newUserInput[y][x] = 3;
              setUserInputBoard(newUserInput);
            })()
          : (() => {
              newUserInput[y][x] = 3;
              setUserInputBoard(newUserInput);
            })();
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
          <CustomSetting
            boardSettings={boardSettings}
            selectedLevelKey={selectedLevelKey}
            customSetting={customSetting}
            setCustomSetting={setCustomSetting}
            setUserInputBoard={setUserInputBoard}
            handleOnSet={handleOnSet}
          />
        )}
        <div className={styles.game}>
          <Info
            boardSettings={boardSettings}
            selectedLevelKey={selectedLevelKey}
            restBombCount={restBombCount}
            timer={timer}
            gameStatus={gameStatus}
            handleOnReset={handleOnReset}
          />
          <Board
            board={board}
            boardSettings={boardSettings}
            selectedLevelKey={selectedLevelKey}
            preferedDark={preferedDark}
            handleOnClick={handleOnClick}
            handleOnContextMenu={handleOnContextMenu}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
