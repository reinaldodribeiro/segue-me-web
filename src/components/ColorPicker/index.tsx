import { ColorPickerProps } from './types';

const ColorPicker: SafeFC<ColorPickerProps> = ({ label, id, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="flex items-center gap-3 h-10 rounded-lg border border-input-border bg-input-bg px-3">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
        />
        <span className="text-sm text-input-text font-mono">{value}</span>
      </div>
    </div>
  );
};

export default ColorPicker;
