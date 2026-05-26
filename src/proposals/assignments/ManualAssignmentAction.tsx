import { UserPlusIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Call } from '@/proposals/types';
import { ActionButton } from '@/table/ActionButton';

const CreateManualAssignmentDialog = lazyComponent(() =>
  import('./CreateManualAssignmentDialog').then((module) => ({
    default: module.CreateManualAssignmentDialog,
  })),
);

interface ManualAssignmentActionProps {
  call: Call;
  refetch: () => void;
}

export const ManualAssignmentAction = ({
  call,
  refetch,
}: ManualAssignmentActionProps) => {
  const { openDialog } = useModal();

  const handleManualAssignment = useCallback(() => {
    openDialog(CreateManualAssignmentDialog, {
      resolve: { call, refetch },
    });
  }, [call, refetch, openDialog]);

  return (
    <ActionButton
      action={handleManualAssignment}
      title={translate('Manual assignment')}
      iconNode={<UserPlusIcon weight="bold" />}
      variant="secondary"
    />
  );
};
