import type { BoardSettings, LevelKey } from '@/constants';
import React from 'react';
import styles from './styles/Info.module.css';

type GameStatus = 'badEnd' | 'goodEnd' | 'waiting' | 'playing';

type InfoProps = {
  boardSettings: BoardSettings;
  selectedLevelKey: LevelKey;
  restBombCount: number;
  timer: number;
  gameStatus: GameStatus;
  handleOnReset: () => void;
};

const Info: React.FC<InfoProps> = ({
  boardSettings,
  selectedLevelKey,
  restBombCount,
  timer,
  gameStatus,
  handleOnReset,
}) => {
  return (
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
            gameStatus === 'badEnd' ? '-390px' : gameStatus === 'goodEnd' ? '-360px' : '-330px',
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
  );
};

export default Info;
