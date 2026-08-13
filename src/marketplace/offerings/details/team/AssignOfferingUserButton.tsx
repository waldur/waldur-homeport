import { UserPlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const AssignOfferingUserDialog = lazyComponent(() =>
  import('./AssignOfferingUserDialog').then((module) => ({
    default: module.AssignOfferingUserDialog,
  })),
);

interface AssignOfferingUserButtonProps {
  offering: Offering;
  refetch(): void;
  disabled?: boolean;
  tooltip?: string;
}

/** "Assign existing user" item of the Team toolbar's Add dropdown. */
export const AssignOfferingUserButton: FC<AssignOfferingUserButtonProps> = ({
  offering,
  refetch,
  disabled,
  tooltip,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Member')}
      iconNode={<UserPlusIcon weight="bold" />}
      action={() =>
        openDialog(AssignOfferingUserDialog, {
          resolve: { offering, refetch },
        })
      }
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
