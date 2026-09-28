import { FunctionComponent } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { SegmentedControl } from 'waldur-ui';

import { translate } from '@/i18n';

export const NodeRoleField: FunctionComponent<FieldRenderProps<string>> = ({
  input,
}) => (
  <SegmentedControl
    aria-label={translate('Node role')}
    options={[
      { value: 'agent', label: translate('Agent') },
      { value: 'server', label: translate('Server') },
    ]}
    value={input.value}
    onValueChange={input.onChange}
  />
);
