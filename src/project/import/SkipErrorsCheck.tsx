import { FormCheck } from 'react-bootstrap';

import { translate } from '@/i18n';

export const SkipErrorsCheck = ({ checked, onChange }) => (
  <FormCheck
    id="confirm-skip-errors"
    type="checkbox"
    className="form-check-custom form-check-sm border-top pt-3"
    checked={checked}
    onChange={onChange}
    label={translate('Skip records with errors')}
  />
);
