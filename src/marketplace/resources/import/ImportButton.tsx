import { FunctionComponent } from 'react';

import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';

export const ImportButton: FunctionComponent<{
  disabled?;
  submitting;
}> = ({ disabled, submitting }) => (
  <SubmitButton
    disabled={disabled}
    submitting={submitting}
    className="flex-equal"
    label={translate('Import')}
  />
);
