import { EnvelopeSimpleIcon, LinkSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { SegmentedControl } from 'waldur-ui';

import { translate } from '@/i18n';

export const HookTypeField: FunctionComponent<{ input }> = ({ input }) => (
  <SegmentedControl
    aria-label={translate('Hook type')}
    options={[
      {
        value: 'email',
        label: (
          <>
            <EnvelopeSimpleIcon weight="bold" size={20} />
            {translate('Email')}
          </>
        ),
      },
      {
        value: 'webhook',
        label: (
          <>
            <LinkSimpleIcon weight="bold" size={20} />
            {translate('Webhook')}
          </>
        ),
      },
    ]}
    value={input.value}
    onValueChange={input.onChange}
  />
);
