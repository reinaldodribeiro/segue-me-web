import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/Input';
import { PasswordInputProps } from './types';

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        endIcon={visible ? <EyeOff size={16} /> : <Eye size={16} />}
        onEndIconClick={() => setVisible((v) => !v)}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
