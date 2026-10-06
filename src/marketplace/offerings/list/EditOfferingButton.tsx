import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { DropdownLink } from './DropdownLink';

export const EditOfferingButton = ({
  row,
}: {
  row: ProviderOfferingDetails;
}) => {
  const user = useUser();

  const canUpdateOffering = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: row.customer_uuid,
  });

  const { state } = useCurrentStateAndParams();
  const targetState =
    state.data?.workspace === 'admin'
      ? 'admin-marketplace-offering-update'
      : 'marketplace-offering-update';

  if (!canUpdateOffering) {
    return null;
  }

  return (
    <Menu.Item asChild>
      <DropdownLink
        state={targetState}
        params={{
          offering_uuid: row.uuid,
          uuid: row.customer_uuid,
        }}
        icon={<PencilSimpleIcon weight="bold" />}
      >
        {translate('Edit')}
      </DropdownLink>
    </Menu.Item>
  );
};
