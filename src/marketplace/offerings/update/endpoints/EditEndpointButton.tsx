import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { NestedEndpoint } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { useEndpointFormDialog } from './useEndpointFormDialog';

export const EditEndpointButton: FC<{
  endpoint: NestedEndpoint;
  offering;
  refetch;
}> = ({ endpoint, offering, refetch }) => {
  const openEndpointForm = useEndpointFormDialog();
  return (
    <BaseButton
      iconNode={<PencilSimpleIcon weight="bold" />}
      label={translate('Edit')}
      onClick={() => openEndpointForm({ offering, endpoint, refetch })}
      variant="tertiary"
      size="sm"
    />
  );
};
