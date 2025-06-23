'use client';

import Board from '@/components/Board';
import CustomSetting from '@/components/CustomSetting';
import DropdownList from '@/components/DropdownList';
import Info from '@/components/Info';
import { useGame } from '@/hooks/useGame';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

const Home = () => {
  const [preferedDark, setPreferedDark] = useState(false);
  const {
    board,
    boardSettings,
    selectedLevelKey,
    customSetting,
    setCustomSetting,
    setUserInputBoard,
    setBombMap,
    setTimer,
    timer,
    gameStatus,
    restBombCount,
    handleOnSelect,
    handleOnReset,
    handleOnSet,
    handleOnContextMenu,
    handleOnClick,
  } = useGame();

  useEffect(() => {
    setPreferedDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

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
            setBombMap={setBombMap}
            handleOnSet={handleOnSet}
            setTimer={setTimer}
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
