import { InputProps } from '@/components/Input/types';

export type PasswordInputProps = Omit<InputProps, 'type' | 'endIcon' | 'onEndIconClick'>;
