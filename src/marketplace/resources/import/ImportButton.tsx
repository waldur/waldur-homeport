import { FunctionComponent } from 'react';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';

export const ImportButton: FunctionComponent<{
  disabled?;
  submitting;
}> = ({ disabled, submitting }) => (
  <SubmitButton
    disabled={disabled}
    submitting={submitting}
    className="flex-1"
    label={translate('Import')}
  />
);
