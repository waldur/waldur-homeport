import React, { lazy, Suspense } from 'react';
import { Validator } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

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
  original?: string;
  options?: any;
}

const loader = () => import('react-monaco-editor');

const ReactMonacoEditor = lazy(loader);

const ReactMonacoDiff = lazy(() =>
  loader().then((module) => ({ default: module.MonacoDiffEditor })),
);

export const MonacoField: React.FC<MonacoFieldProps> = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    {props.diff ? (
      <ReactMonacoDiff
        height={props.height}
        language={props.mode}
        value={props.input.value}
        onChange={props.input.onChange}
        original={props.original}
        options={props.options}
      />
    ) : (
      <ReactMonacoEditor
        height={props.height}
        language={props.mode}
        value={props.input.value}
        onChange={props.input.onChange}
        options={props.options}
      />
    )}
  </Suspense>
);

MonacoField.defaultProps = {
  height: 600,
  options: {
    automaticLayout: true,
  },
};
