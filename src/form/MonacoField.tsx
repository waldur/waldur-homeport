import React, { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Validator } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { RootState } from '@waldur/store/reducers';

interface MonacoFieldProps {
  name?: string;
  label?: string;
  required?: boolean;
  description?: string;
  validate?: Validator;
  input?: { value; onChange };
  diff?: boolean;
  mode?: string;
  height?: number;
  width?: number;
  original?: string;
  options?: any;
}

const loader = () => import('react-monaco-editor');

const ReactMonacoEditor = lazy(loader);

const ReactMonacoDiff = lazy(() =>
  loader().then((module) => ({ default: module.MonacoDiffEditor })),
);

const getTheme = (): string => {
  const theme = useSelector((state: RootState) => state.theme?.theme);
  return theme === 'dark' ? 'vs-dark' : 'vs-light';
};

export const MonacoField: React.FC<MonacoFieldProps> = ({
  height = 600,
  options = {
    automaticLayout: true,
  },
  ...props
}) => (
  <Suspense fallback={<LoadingSpinner />}>
    {props.diff ? (
      <ReactMonacoDiff
        height={height}
        language={props.mode}
        value={props.input.value}
        onChange={props.input.onChange}
        original={props.original}
        options={options}
        width={props.width}
        theme={getTheme()}
      />
    ) : (
      <ReactMonacoEditor
        height={height}
        width={props.width}
        language={props.mode}
        value={props.input.value}
        onChange={props.input.onChange}
        options={options}
        theme={getTheme()}
      />
    )}
  </Suspense>
);
