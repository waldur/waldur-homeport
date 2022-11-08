import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const IssueCreateDialog = lazyComponent(
  () => import('@waldur/issues/create/IssueCreateDialog'),
  'IssueCreateDialog',
);

export const openIssueCreateDialog = (resolve, formId?: string) =>
  openModalDialog(IssueCreateDialog, {
    resolve,
    formId,
    dialogClassName: 'modal-dialog-centered mw-650px',
  });
