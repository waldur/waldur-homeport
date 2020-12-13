import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const IssueCreateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "IssueCreateDialog" */ '@waldur/issues/create/IssueCreateDialog'
    ),
  'IssueCreateDialog',
);

export const openIssueCreateDialog = (resolve, formId?: string) =>
  openModalDialog(IssueCreateDialog, { resolve, formId });
