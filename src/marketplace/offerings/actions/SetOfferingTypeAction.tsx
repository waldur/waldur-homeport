import { ArrowsLeftRightIcon } from '@phosphor-icons/react';
import { ProviderOffering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isSiteAgentOfferingType } from '@/site-agent/constants';
import { BASIC_OFFERING_TYPE } from '@/support/constants';
import { useUser } from '@/workspace/hooks';

const SetOfferingTypeDialog = lazyComponent(() =>
  import('./SetOfferingTypeDialog').then((module) => ({
    default: module.SetOfferingTypeDialog,
  })),
);

interface SetOfferingTypeActionProps {
  row: ProviderOffering;
  refetch: () => void;
}

export const SetOfferingTypeAction = ({
  row,
  refetch,
}: SetOfferingTypeActionProps) => {
  const user = useUser();
  const { openDialog } = useModal();

  if (
    !row.type ||
    (row.type !== BASIC_OFFERING_TYPE && !isSiteAgentOfferingType(row.type))
  ) {
    return null;
  }

  const canUpdateOffering = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: row.customer_uuid,
  });
  if (!canUpdateOffering) {
    return null;
  }

  const callback = () =>
    openDialog(SetOfferingTypeDialog, {
      resolve: {
        offering: row,
        refetch,
      },
    });

  return (
    <ActionItem
      title={translate('Change offering type')}
      action={callback}
      iconNode={<ArrowsLeftRightIcon weight="bold" />}
    />
  );
};
