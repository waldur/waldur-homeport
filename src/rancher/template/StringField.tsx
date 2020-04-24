import * as React from 'react';
import * as FormControl from 'react-bootstrap/lib/FormControl';

import { DecoratedField } from './DecoratedField';
import { FieldProps } from './types';

const renderControl = props => <FormControl {...props.input} />;

export const StringField: React.FC<FieldProps> = props => (
  <DecoratedField {...props} component={renderControl} />
);
