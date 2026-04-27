import { FC } from 'react';
import { Checklist } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

import { CHECKLIST_FORM_ID } from '../constants';

const ChecklistFormDialog = lazyComponent(() =>
  import('./ChecklistFormDialog').then((module) => ({
    default: module.ChecklistFormDialog,
  })),
);

interface ChecklistEditActionProps {
  row: Checklist;
  refetch(): void;
}

export const ChecklistEditAction: FC<ChecklistEditActionProps> = ({
  row,
  refetch,
}) => (
  <EditModalButton
    dialog={ChecklistFormDialog}
    row={row}
    buildResolve={(r) => ({ refetch, checklistUuid: r.uuid })}
    getInitialValues={(r) => ({
      name: r.name,
      checklist_type: r.checklist_type,
      description: r.description,
    })}
    formId={CHECKLIST_FORM_ID}
  />
);
