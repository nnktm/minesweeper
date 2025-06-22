import { LEVEL_KEYS, LEVEL_NAMES, type LevelKey } from '@/constants';
import React from 'react';
import styles from './styles/DropdownList.module.css';

type DropdownListProps = {
  onChange: (levelKey: LevelKey) => void;
  levelKey: LevelKey;
};

const DropdownList: React.FC<DropdownListProps> = ({ levelKey, onChange }) => {
  return (
    <select
      className={styles.dropdownList}
      value={levelKey}
      onChange={(e) => onChange(e.target.value as LevelKey)}
    >
      {LEVEL_KEYS.map((key) => (
        <option key={key} value={key}>
          {LEVEL_NAMES[key]}
        </option>
      ))}
    </select>
  );
};

export default DropdownList;
