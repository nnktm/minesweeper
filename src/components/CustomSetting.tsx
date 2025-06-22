import type { BoardSetting, BoardSettings, LevelKey } from '@/constants';
import React from 'react';
import styles from './styles/CustomSetting.module.css';

type CustomSettingProps = {
  boardSettings: BoardSettings;
  selectedLevelKey: LevelKey;
  customSetting: BoardSetting;
  setTimer: (timer: number) => void;
  setCustomSetting: (customSetting: BoardSetting) => void;
  setUserInputBoard: (userInputBoard: number[][]) => void;
  setBombMap: (bombMap: number[][]) => void;
  handleOnSet: () => void;
};

const CustomSetting: React.FC<CustomSettingProps> = ({
  boardSettings,
  selectedLevelKey,
  customSetting,
  setTimer,
  setCustomSetting,
  setUserInputBoard,
  setBombMap,
  handleOnSet,
}) => {
  return (
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
                    setTimer(0);
                    setCustomSetting(newCustomSetting);
                    const newBoard = Array.from({ length: newCustomSetting.height }, () =>
                      Array.from({ length: newCustomSetting.width }, () => 0),
                    );
                    setUserInputBoard(newBoard);
                    setBombMap(newBoard);
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
            Number(e.target.value) * customSetting.width < boardSettings[selectedLevelKey].bombCount
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
                    const newBoard = Array.from({ length: newCustomSetting.height }, () =>
                      Array.from({ length: newCustomSetting.width }, () => 0),
                    );
                    setUserInputBoard(newBoard);
                    setBombMap(newBoard);
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
                    const newBoard = Array.from({ length: newCustomSetting.height }, () =>
                      Array.from({ length: newCustomSetting.width }, () => 0),
                    );
                    setUserInputBoard(newBoard);
                    setBombMap(newBoard);
                  })();
          }}
          className={styles.textBox}
        />
      </div>
      <button onClick={handleOnSet} className={styles.setButton}>
        更新
      </button>
    </div>
  );
};

export default CustomSetting;
