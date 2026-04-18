import { cn } from '@/utils/helpers';
import { ToggleProps } from './types';

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
};

export default Toggle;
