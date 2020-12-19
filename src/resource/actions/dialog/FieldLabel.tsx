import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const FieldLabel: FunctionComponent<{ field }> = ({ field }) => (
  <>
    {translate(field.label)}{' '}
    <span className="text-danger">{(field.required && '*') || ''}</span>
  </>
);
