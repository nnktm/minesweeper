import type { BoardSettings, LevelKey } from '@/constants';
import React from 'react';
import styles from './Board.module.css';
type BoardProps = {
  board: number[][];
  boardSettings: BoardSettings;
  selectedLevelKey: LevelKey;
  preferedDark: boolean;
  handleOnClick: (e: React.MouseEvent, y: number, x: number) => void;
  handleOnContextMenu: (e: React.MouseEvent, y: number, x: number) => void;
};

const Board: React.FC<BoardProps> = ({
  board,
  boardSettings,
  selectedLevelKey,
  preferedDark,
  handleOnClick,
  handleOnContextMenu,
}) => {
  return (
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
  );
};

export default Board;
