import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

import { ISSUE_CREATION_FORM_ID } from './constants';

const IssueCreateDialog = lazyComponent(() =>
  import('@/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

export const openIssueCreateDialog = (resolve) =>
  openModalDialog(IssueCreateDialog, {
    resolve,
    dialogClassName: 'modal-dialog-centered mw-650px',
    formId: ISSUE_CREATION_FORM_ID,
  });
