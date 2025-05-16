import React from 'react';

type DropdownListProps = {
  options: { value: string }[];
  onChange: (value: string) => void;
  value: string;
};

const DropdownList: React.FC<DropdownListProps> = ({ options, onChange, value }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">選んでください</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.value}
        </option>
      ))}
    </select>
  );
};

export default DropdownList;
