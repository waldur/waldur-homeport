import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { useEndpointFormDialog } from './useEndpointFormDialog';

export const AddEndpointButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const openEndpointForm = useEndpointFormDialog();
  return (
    <BaseButton
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Add endpoint')}
      onClick={() => openEndpointForm({ offering, refetch })}
      variant="tertiary"
      size="lg"
    />
  );
};
