import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { MonacoEditor, MonacoEditorProps } from './MonacoEditor';

interface MonacoFieldProps extends Omit<
  MonacoEditorProps,
  'value' | 'onChange'
> {
  input: FieldRenderProps<any>['input'];
}

export const MonacoField: FC<MonacoFieldProps> = ({
  height = 600,
  ...props
}) => (
  <MonacoEditor
    language={props.language}
    value={props.input.value}
    onChange={props.input.onChange}
    readOnly={props.readOnly}
    height={height}
  />
);
