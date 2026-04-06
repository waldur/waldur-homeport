import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const PersonalAccessTokenCreateDialog = lazyComponent(() =>
  import('./PersonalAccessTokenCreateDialog').then((module) => ({
    default: module.PersonalAccessTokenCreateDialog,
  })),
);

export const personalAccessTokenCreateDialog = (refetch?) =>
  openModalDialog(PersonalAccessTokenCreateDialog, {
    size: 'lg',
    resolve: { refetch },
  });
