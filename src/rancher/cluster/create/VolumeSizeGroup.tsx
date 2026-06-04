import { FunctionComponent } from 'react';

import { required } from '@/core/validators';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';

import { IntegerUnitField } from './IntegerUnitField';

export const VolumeSizeGroup: FunctionComponent<{ name?: string }> = ({
  name = 'size',
}) => (
  <NumberGroup
    label={translate('Volume size')}
    required={true}
    name={name}
    units={translate('GB')}
    component={IntegerUnitField}
    parse={parseIntField}
    format={formatIntField}
    validate={required}
  />
);
