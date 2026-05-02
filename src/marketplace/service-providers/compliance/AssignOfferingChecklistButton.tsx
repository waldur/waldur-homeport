import { ArrowSquareInIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { ASSIGN_CHECKLIST_TO_OFFERINGS_FORM_ID } from '../constants';

const AssignOfferingChecklistFormDialog = lazyComponent(() =>
  import('./AssignOfferingChecklistFormDialog').then((module) => ({
    default: module.AssignOfferingChecklistFormDialog,
  })),
);

export const AssignOfferingChecklistButton = ({ provider, refetch }) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(AssignOfferingChecklistFormDialog, {
      resolve: { provider, refetch },
      size: 'lg',
      formId: ASSIGN_CHECKLIST_TO_OFFERINGS_FORM_ID,
    });

  return (
    <ActionButton
      action={callback}
      title={translate('Assign checklist')}
      iconNode={<ArrowSquareInIcon weight="bold" />}
      variant="primary"
    />
  );
};
