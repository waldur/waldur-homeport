import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const SelectWorkspaceDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SelectWorkspaceDialog" */ './SelectWorkspaceDialog'
    ),
  'SelectWorkspaceDialog',
);

export const openSelectWorkspaceDialog = () =>
  openModalDialog(SelectWorkspaceDialog, {
    size: 'xl',
    dialogClassName: 'modal-metro',
  });
