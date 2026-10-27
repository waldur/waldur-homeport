import { ChangeEventHandler, FC } from 'react';

import { Checkbox } from 'waldur-ui';

import { translate } from '@/i18n';

export const SkipErrorsCheck: FC<{
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}> = ({ checked, onChange }) => (
  <Checkbox
    id="confirm-skip-errors"
    size="sm"
    checked={checked}
    onChange={onChange}
    className="border-t-[1px] border-t-secondary pt-2.5"
    label={translate('Skip records with errors')}
  />
);
