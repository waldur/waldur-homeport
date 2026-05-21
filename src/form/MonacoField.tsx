import { FieldValidator } from 'final-form';
import { FC } from 'react';

import { useTheme } from '@/theme/useTheme';

import { MonacoEditor } from './MonacoEditor';

interface MonacoFieldProps {
  name?: string;
  label?: string;
  required?: boolean;
  description?: string;
  validate?: FieldValidator<string>;
  input?: any;
  diff?: boolean;
  language?: string;
  height?: number;
  width?: number;
  original?: string;
  options?: any;
  readOnly?: boolean;
  format?: (value: any) => any;
}

const getTheme = (): string => {
  const { theme } = useTheme();
  return theme === 'dark' ? 'vs-dark' : 'vs-light';
};

export const MonacoField: FC<MonacoFieldProps> = ({
  height = 600,
  ...props
}) => (
  <MonacoEditor
    language={props.language}
    value={props.input.value}
    onChange={props.input.onChange}
    readOnly={props.readOnly}
    theme={getTheme()}
    height={height}
  />
);
