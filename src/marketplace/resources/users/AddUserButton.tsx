import { UserPlusIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

interface AddUserButtonProps {
  scope: 'resource' | 'resource_project';
  scopeUuid: string;
  projectUuid: string;
  offering;
  refetch();
  /**
   * When true, renders the action disabled with an explanatory tooltip
   * (matches org `UserAddButton` behaviour for non-staff users).
   */
  disabled?: boolean;
  tooltip?: string;
}

/**
 * "Assign existing user" action. Renders as an `ActionItem` so it
 * sits inside the Team toolbar's Add dropdown alongside Invite,
 * matching the org-level Team page pattern.
 */
export const AddUserButton: FunctionComponent<AddUserButtonProps> = ({
  scope,
  scopeUuid,
  projectUuid,
  offering,
  refetch,
  disabled,
  tooltip,
}) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddUserDialog, {
      resolve: { scope, scopeUuid, projectUuid, offering, refetch },
    });
  };
  return (
    <ActionItem
      iconNode={<UserPlusIcon weight="bold" />}
      title={translate('Member')}
      action={callback}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
