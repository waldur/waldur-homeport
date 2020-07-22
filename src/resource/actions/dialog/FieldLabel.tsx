import * as React from 'react';

import { translate } from '@waldur/i18n';

export const FieldLabel = ({ field }) => (
  <>
    {translate(field.label)}{' '}
    <span className="text-danger">{(field.required && '*') || ''}</span>
  </>
);
